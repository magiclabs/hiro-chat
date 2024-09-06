import { concat } from "@langchain/core/utils/stream";
import {
  BaseTransformOutputParser,
  OutputParserException,
} from "@langchain/core/output_parsers";

export class CustomOutputStreamParser extends BaseTransformOutputParser<string> {
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
      console.log({ text: llmOutputs[0].text });
      // const message = llmOutputs[0]?.message;
      // console.log(llmOutputs[0]);
      // if (message?.tool_call_chunks?.length) {
      //   this.gathered =
      //     this.gathered !== undefined
      //       ? concat(this.gathered, message)
      //       : message;
      // }
      // // else if (message.text === "json") {
      // //   console.log(message);
      // //   output = llmOutputs[0].text;
      // // }
      // else {
      //   output = llmOutputs[0].text;
      // }
      // if (message?.response_metadata?.finish_reason === "tool_calls") {
      //   output = JSON.stringify({ toolCall: this.gathered?.tool_calls[0] });
      // }

      return output;
    } catch (e: any) {
      throw new OutputParserException(
        `Failed to parse. Text: "${output}". Error: ${e.message}`,
      );
    }
  }
}
