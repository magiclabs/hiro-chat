import {
  BaseTransformOutputParser,
  OutputParserException,
} from "@langchain/core/output_parsers";

export class CustomParser extends BaseTransformOutputParser<string> {
  lc_namespace = ["langchain", "output_parsers"];

  constructor(fields?: {}) {
    super(fields);
  }

  async parse(text: string): Promise<string> {
    return text;
  }

  getFormatInstructions(): string {
    return "";
  }

  async parseResult(llmOutputs: any[]): Promise<string> {
    if (!llmOutputs.length) {
      throw new OutputParserException(
        "Output parser did not receive any generations.",
      );
    }
    let output = "";

    try {
      if (llmOutputs[0]?.message?.tool_call_chunks?.[0]) {
        if (llmOutputs[0]?.message?.tool_call_chunks?.[0]?.name) {
          output = `name: ${llmOutputs[0]?.message?.tool_call_chunks?.[0]?.name}, args: `;
        } else {
          output = llmOutputs[0]?.message?.tool_call_chunks?.[0]?.args;
        }
      } else {
        output = llmOutputs[0].text;
      }

      return output;
    } catch (e: any) {
      throw new OutputParserException(
        `Failed to parse. Text: "${output}". Error: ${e.message}`,
      );
    }
  }
}
