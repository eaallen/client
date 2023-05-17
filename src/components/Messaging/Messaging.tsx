import { Box, Button, FormControl, Stack, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import React from "react";
import MessageHistory, { MessageItem } from "./MessageHistory";

export default function Messaging(props: {}) {
    return (
        <Box>
            <MessageHistory history={testHistory}></MessageHistory>
            <Stack spacing={2}>
                <TextField label="Outlined" variant="outlined" />
                <Button variant="contained" endIcon={<SendIcon />}>
                    Send
                </Button>
            </Stack>
        </Box>
    )
}

const testHistory: Array<MessageItem> = [
    { content: "Hello", role: "user" },
    { content: "Hi", role: "assistant" },
    { content: "How are you?", role: "user" },
    { content: "I am a computer. I do not have feelings.", role: "assistant" }
]