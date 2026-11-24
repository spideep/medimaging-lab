const ORTHANC_URL = process.env.ORTHANC_URL ?? "http://localhost:8042";

const ORTHANC_USER = process.env.ORTHANC_USER;
const ORTHANC_PASSWORD = process.env.ORTHANC_PASSWORD;

export type DicomDataset = Record<string, unknown>;

export async function getStudies(): Promise<DicomDataset[]> {
  if (!ORTHANC_USER || !ORTHANC_PASSWORD) {
    throw new Error("Missing Orthanc credentials");
  }

  const credentials = Buffer.from(
    `${ORTHANC_USER}:${ORTHANC_PASSWORD}`,
  ).toString("base64");

  console.log("=== DICOMweb Client ===");
  console.log(
    `Fetching studies from Orthanc at ${ORTHANC_URL} with user ${ORTHANC_USER} and password ${ORTHANC_PASSWORD}`,
  );

  const response = await fetch(`${ORTHANC_URL}/dicom-web/studies`, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/dicom+json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Orthanc request failed: HTTP ${response.status}`);
  }

  return (await response.json()) as DicomDataset[];
}
