Decisión: utilizar OrthanC como servidor DICOM y fuente principal de almacenamiento de estudios médicos.

Justificación: soporta DICOM clásico, dispone de un plugin DICOMweb, permite integración con OHIF y se puede desplegar mediante Docker.

Consecuencias: nuestro backend Node.js no implementará un servidor DICOM propio. La seguridad, la persistencia y la interoperabilidad deberán configurarse y verificarse explícitamente.


**********
Decisión: Utilizar GitHub actions y un CI para probar las partes más importantes del contenedor y orthanc en cuanto se actualice el código. 

Justificante: Es una manera económica y automatizada de asegurarnos que el build de composer y la funcionalidad es mínimamente operativa tras los cambios que se susciten. 

Consecuencias: Nos ahorraremos la  implementación de las pruebas en un ambiente separado y correrlo manualmente. 