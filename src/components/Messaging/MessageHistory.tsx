import { Box, Card, CardContent, CardHeader, Stack } from "@mui/material"

interface Props {
    history: Array<MessageItem>
}

export interface MessageItem {
    content: string
    role: "user" | "assistant" | "system"
}

export default function MessageHistory(props: Props) {
    return <Box>
        <Card>
            <CardHeader title="Messgae History" />
            <CardContent>
                {props.history.map((item, idx) => <Message content={item.content} role={item.role} key={idx} />)}
            </CardContent>
        </Card>
    </Box>
}

function Message(props: MessageItem) {
    if (props.role === "user" || props.role === "system") {
        return <Box>
            <Stack
                direction="row-reverse"
                spacing={2}
            >
                {props.content} <br />
                {props.role}
            </Stack>

        </Box>
    } else {
        return <Box>
            <Stack
                direction="row"
                spacing={2}
            >
                {props.content} <br />
                {props.role}
            </Stack>

        </Box>
    }

}