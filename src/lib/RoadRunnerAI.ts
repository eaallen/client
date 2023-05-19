import { ChatCompletionRequestMessage, CreateChatCompletionRequest, CreateChatCompletionResponse } from "openai"

const url = "http://127.0.0.1:5001/prime-micron-374215/us-central1/roadRunnerAI"

export interface WebRequestParams<T> {
    mode: string
    token: string
    payload: T
}

interface ChatPayload{
    request: CreateChatCompletionRequest
}

interface ChatResponse<T>{
    status: string
    message: string
    response: T
}

async function roadrunnerEndPointChat(request: WebRequestParams<ChatPayload>): Promise<ChatResponse<CreateChatCompletionResponse>>{
    try {
        const resp = await fetch(url,
            {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request), // body data type must match "Content-Type" header
            })
        return await resp.json()
    } catch (e) {
        // TODO: handle errors
        throw e
    }
}

export default class RoadRunnerAI {
    schema: string | undefined
    response: CreateChatCompletionResponse | undefined

    private request: CreateChatCompletionRequest = { model: "gpt-3.5-turbo", messages: [] }
    totalTokens: number = 0
    primer: ChatCompletionRequestMessage[] | null = null



    constructor(schema: string | undefined = undefined) {
        this.schema = schema
    }

    async chat() {
        if (this.primer !== null) {
            this.request.messages.unshift(...this.primer)
            this.primer = null
        }

        const resp = (await roadrunnerEndPointChat({
            token: '',
            mode: "chat",
            payload: {request: this.request}
        })).response
        this.response = resp
        this.totalTokens += this.response?.usage?.total_tokens ?? 0
        console.log("total token", this.totalTokens)
        if (resp.choices[0].message) {
            this.request.messages.push(resp.choices[0].message) // append respone so we can continue the conversation
        }

        return resp
    }

    primeChat(userContent: string){
        this.primer = [
            {
                role: "user",
                content: `You are an assistant that answers questions realted to SQL. You do not explain code you return. ${
                    this.schema ? `Use this table schema ${this.schema} as a referance.` : ""} ${userContent}`,
            },
            {
                role: "assistant",
                content: "I will not explain the code I return. How can I help you today?"
            },
        ]
    }

    async startChat(userContent: string) {
        this.primeChat(userContent)
        await this.chat()
    }

    userSaid(userMessage: string){
        this.request.messages.push({
            role: "user",
            content: userMessage,
        })
    }

    async userSays(userMessage: string) {
        this.userSaid(userMessage)
        return await this.chat()
    }

    printInteraction() {
        const message = this.request.messages[this.request.messages.length - 1]
        let str = ""
        str += `## ${message.role}\n`
        str += `${message.content}\n`
        str += "\n"
        console.log(str)
    }

    history(): ChatCompletionRequestMessage[] {
        return this.request.messages
    }

    totalCost() {
        // $0.002 / 1K tokens
        // 1000T = $0.002 ----> 1T = $0.002 / 1000
        const costPerToken = 0.002 / 1000
        return (this.totalTokens * costPerToken)
    }

    setSchema(schema: string){
        this.schema = schema
    }


}
