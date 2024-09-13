import { concat } from "@langchain/core/utils/stream";
import {
  BaseTransformOutputParser,
  OutputParserException,
} from "@langchain/core/output_parsers";

const isToolCallFinished = (metadata: Record<string, any>) =>
  // metadata?.done_reason === "stop" is not exclusive to responses that are tool_calls
  // but its the stop signal for all responses that are tool calls from local llama3.1
  metadata?.finish_reason === "tool_calls" || metadata?.done_reason === "stop";

export class CustomParser extends BaseTransformOutputParser<string> {
  lc_namespace = ["langchain", "output_parsers"];
  gathered: any = undefined;
  hasToolCall: boolean = false;
  logger: string = "";
  logPrefix: string = "";

  constructor(fields?: {}) {
    super(fields);
    // @ts-ignore
    this.log = fields?.log;
    this.logPrefix = `${+new Date()}`;
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
      // console.log(message);
      if (message?.tool_call_chunks?.length || message?.tool_calls?.length) {
        this.hasToolCall = true;
        this.gathered =
          this.gathered !== undefined
            ? concat(this.gathered, message)
            : message;
      } else {
        output = llmOutputs[0].text;
      }

      if (isToolCallFinished(message?.response_metadata) && this.hasToolCall) {
        console.log(
          this.logger,
          "custom parser",
          message?.response_metadata,
          isToolCallFinished(message?.response_metadata),
        );
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
