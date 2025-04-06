import ExpoModulesCore
import Vision

public class OcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OcrModule")

    AsyncFunction("recognizeTextAsync") { (uriString: String, languageCode: String) -> String in
      guard let url = URL(string: uriString), url.isFileURL else {
        throw NSError(domain: "OcrModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid file URI"])
      }

      guard let imageData = try? Data(contentsOf: url),
            let uiImage = UIImage(data: imageData),
            let cgImage = uiImage.cgImage else {
        throw NSError(domain: "OcrModule", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to load image"])
      }

      return try await withCheckedThrowingContinuation { continuation in
        let request = VNRecognizeTextRequest { request, error in
          if let error = error {
            continuation.resume(throwing: error)
            return
          }

          guard let observations = request.results as? [VNRecognizedTextObservation], !observations.isEmpty else {
            continuation.resume(returning: "")
            return
          }

          let recognized = observations
            .compactMap { $0.topCandidates(1).first?.string }
            .joined(separator: "\n")

          continuation.resume(returning: recognized)
        }

        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.recognitionLanguages = [languageCode]  // dynamic language input

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
          try handler.perform([request])
        } catch {
          continuation.resume(throwing: error)
        }
      }
    }
  }
}
