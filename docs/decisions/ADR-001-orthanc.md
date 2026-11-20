Decisión: utilizar OrthanC como servidor DICOM y fuente principal de almacenamiento de estudios médicos.

Justificación: soporta DICOM clásico, dispone de un plugin DICOMweb, permite integración con OHIF y se puede desplegar mediante Docker.

Consecuencias: nuestro backend Node.js no implementará un servidor DICOM propio. La seguridad, la persistencia y la interoperabilidad deberán configurarse y verificarse explícitamente.