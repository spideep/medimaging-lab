"""End-to-end DICOMweb smoke test against a disposable Orthanc instance."""
import io
import os
from email.parser import BytesParser
from email.policy import default
from uuid import uuid4

import pydicom
import requests
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import (
    ExplicitVRLittleEndian,
    PYDICOM_IMPLEMENTATION_UID,
    SecondaryCaptureImageStorage,
    generate_uid,
)

BASE_URL = os.getenv("ORTHANC_URL", "http://localhost:8042").rstrip("/")
USERNAME = os.getenv("ORTHANC_USERNAME", "medimaging")
PASSWORD = os.environ["ORTHANC_PASSWORD"]
DICOMWEB = f"{BASE_URL}/dicom-web"


def create_synthetic_dicom():
    study_uid, series_uid, instance_uid = (generate_uid() for _ in range(3))
    meta = FileMetaDataset()
    meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    meta.MediaStorageSOPInstanceUID = instance_uid
    meta.TransferSyntaxUID = ExplicitVRLittleEndian
    meta.ImplementationClassUID = PYDICOM_IMPLEMENTATION_UID

    ds = FileDataset(None, {}, file_meta=meta, preamble=b"\x00" * 128)
    ds.SOPClassUID = SecondaryCaptureImageStorage
    ds.SOPInstanceUID = instance_uid
    ds.StudyInstanceUID = study_uid
    ds.SeriesInstanceUID = series_uid
    ds.PatientName = "SYNTHETIC^TEST"
    ds.PatientID = f"TEST-{uuid4().hex[:12]}"
    ds.Modality = "OT"
    ds.ConversionType = "SYN"
    ds.StudyDate = "20260101"
    ds.StudyTime = "120000"
    ds.ContentDate = "20260101"
    ds.ContentTime = "120000"
    ds.SeriesNumber = 1
    ds.InstanceNumber = 1
    ds.ImageType = ["DERIVED", "SECONDARY"]
    ds.Rows = 16
    ds.Columns = 16
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = 8
    ds.BitsStored = 8
    ds.HighBit = 7
    ds.PixelRepresentation = 0
    ds.PixelData = bytes(range(256))

    out = io.BytesIO()
    ds.save_as(out, enforce_file_format=True)
    return ds, out.getvalue()


def main():
    original, dicom_bytes = create_synthetic_dicom()
    session = requests.Session()
    session.auth = (USERNAME, PASSWORD)

    # STOW-RS is a MIME multipart/related request, not multipart/form-data.
    boundary = f"dicom-{uuid4().hex}"
    body = (
        f"--{boundary}\r\nContent-Type: application/dicom\r\n\r\n".encode()
        + dicom_bytes
        + f"\r\n--{boundary}--\r\n".encode()
    )
    response = session.post(
        f"{DICOMWEB}/studies",
        data=body,
        headers={
            "Content-Type": f'multipart/related; type="application/dicom"; boundary={boundary}',
            "Accept": "application/dicom+json",
        },
        timeout=30,
    )
    response.raise_for_status()
    assert response.status_code == 200, f"Unexpected STOW status {response.status_code}"
    print("PASS STOW-RS: DICOM instance stored")

    # DICOM JSON uses numeric tag keys; 0020000D = StudyInstanceUID.
    response = session.get(
        f"{DICOMWEB}/studies",
        params={"StudyInstanceUID": original.StudyInstanceUID},
        headers={"Accept": "application/dicom+json"},
        timeout=30,
    )
    response.raise_for_status()
    studies = response.json()