import { concat } from "@langchain/core/utils/stream";
import {
  BaseTransformOutputParser,
  OutputParserException,
} from "@langchain/core/output_parsers";

export class CustomParser extends BaseTransformOutputParser<string> {
  lc_namespace = ["langchain", "output_parsers"];
  gathered: any = undefined;

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
      const message = llmOutputs[0]?.message;
      if (message?.tool_call_chunks?.length) {
        this.gathered =
          this.gathered !== undefined
            ? concat(this.gathered, message)
            : message;
      } else {
        output = llmOutputs[0].text;
      }
      if (message?.response_metadata?.finish_reason === "tool_calls") {
        output = JSON.stringify({ toolCall: this.gathered?.tool_calls[0] });
      }

      return output;
    } catch (e: any) {
      throw new OutputParserException(
        `Failed to parse. Text: "${output}". Error: ${e.message}`,
      );
    }
  }
}
