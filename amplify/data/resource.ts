import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateImage,  getNews} from "../function/resource";

const schema = a.schema({
  // === Todo-style Relational Database ===
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // === Bedrock Integration via AI & Tools ===
  Story: a
    .model({
      title: a.string().required(),
      story: a.string().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
      systemPrompt:
        "You are a story telling finder. You will assist " +
        "the user in finding a story that matches the story string, " +
        "title string or id.",
      tools: [
        a.data.modelTool({
          name: "listStories",
          description: "List all stories from the Story model.",
          model: a.ref("Story"),
          operation: "list",
        }),
        a.data.queryTool({
          name: "getNews",
          description: "Help generate a story prompt using the current news.",
          query: a.ref("getNews"),
        }),
        a.data.queryTool({
          name: "knowledgeBase",
          description:
            "Used to search a knowledge base of style dictionary documentation.",
          query: a.ref("knowledgeBase"),
        }),
      ],
    })
    .authorization((allow) => allow.owner()),

  summarizer: a
    .generation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
      systemPrompt:
        "You are a helpful assistant that summarizes stories in one or two sentences.",
      inferenceConfiguration: {
        temperature: 0.7,
        topP: 1,
        maxTokens: 400,
      },
    })
    .arguments({
      story: a.string(),
    })
    .returns(
      a.customType({
        summary: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()]),

  generateStory: a
    .generation({
      aiModel: a.ai.model("Claude 3 Sonnet"),
      systemPrompt:
        "Generate a story and a title that's fun and exciting with a cliffhanger.",
    })
    .arguments({
      description: a.string(),
    })
    .returns(
      a.customType({
        story: a.string().required(),
        title: a.string().required(),
      })
    )
    .authorization((allow) => allow.authenticated()),

  generateImage: a
    .query()
    .arguments({
      prompt: a.string(),
    })
    .returns(a.string().array())
    .handler(a.handler.function(generateImage))
    .authorization((allow) => [allow.authenticated()]),

  getNews: a
    .query()
    .arguments({
      category: a.string(),
    })
    .returns(
      a.customType({
        title: a.string(),
        description: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated())
    .handler(a.handler.function(getNews)),

  knowledgeBase: a
    .query()
    .arguments({ input: a.string() })
    .handler(
      a.handler.custom({
        dataSource: "KnowledgeBaseDataSource",
        entry: "./kbResolver.js",
      })
    )
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});