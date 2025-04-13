import { NativeModule, registerWebModule } from 'expo';


class OcrModule extends NativeModule {
  async recognizeTextAsync(uri: string, languageCode: string): Promise<{
    recognizedText: string[];
  }> {
    throw new Error('The OCR module is not supported on Web.');
  }
}

export default registerWebModule(OcrModule);
