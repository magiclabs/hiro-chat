import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { getModel } from "./getModel";

const timestampTool = new DynamicStructuredTool({
  name: "calculateTimestamp",
  description:
    "When the user asks you about time, determine the difference in seconds the user is referring to, then pass that amount of seconds to this function",
  schema: z.object({
    seconds: z
      .number()
      .describe(
        "This is the relative amount of seconds to compute the timestamp for",
      ),
  }),
  func: async ({ seconds }: { seconds: number }) =>
    Math.floor(new Date(Date.now() + seconds * 1000).getTime() / 1000),
});

export const getTimestampLambda = (modelName: string) => {
  const unboundModel = getModel(modelName).bindTools([timestampTool]);
  return new RunnableLambda({
    func: async (props: { input: string; contractAddresses: string[] }) => {
      const analysisPrompt = ChatPromptTemplate.fromTemplate(
        "You are an expert on determining the relative amount of seconds based on a user input. The current time as a unix timestamp is: {timestamp}. The current time as a humanized string is {humanizedTimestamp}.  Input: {input}",
      );
      const result = await analysisPrompt.pipe(unboundModel).invoke({
        input: props.input,
        timestamp: `${Math.floor(Date.now() / 1000)}`,
        humanizedTimestamp: `${new Date().toLocaleDateString(
          "en-US",
        )} ${new Date().toLocaleTimeString("en-US")}`,
      });

      let timestamp: number | undefined;
      if (result.tool_calls?.[0]?.args) {
        timestamp = await timestampTool.invoke(
          result.tool_calls[0].args as { seconds: number },
        );
      }
      return {
        input: props.input,
        contractAddresses: props.contractAddresses,
        timestamp,
      };
    },
  });
};
