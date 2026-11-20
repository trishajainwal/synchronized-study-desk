class BackendError(Exception):
    pass


class InvalidPdfError(BackendError):
    pass


class PdfTooLargeError(BackendError):
    pass


class DocumentProcessingError(BackendError):
    pass


class DocumentNotFoundError(BackendError):
    pass


class SyncSessionNotFoundError(BackendError):
    pass


class AnnotationError(BackendError):
    pass


class AnnotationNotFoundError(AnnotationError):
    pass


class ReadingPositionError(BackendError):
    pass


class OllamaError(BackendError):
    pass
