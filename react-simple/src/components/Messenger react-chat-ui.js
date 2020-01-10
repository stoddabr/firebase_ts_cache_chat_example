import React, { useState } from 'react';
import { ChatFeed, Message } from 'react-chat-ui'

export function Messenger() {
    let [isTyping, setIsTyping] = useState(false)
    let [messages, setMessages] = useState([ 
        new Message({
            id: 1,
            message: "this is a message in blue (other)"
        }), 
        new Message({
            id: 0,
            message: "this is a message gray (you)"
        })
    ]
    )

    return(
        <div></div>
        <ChatFeed
            messages={messages} // Boolean: list of message objects
            isTyping={isTyping} // Boolean: is the recipient typing
            hasInputField={false} // Boolean: use our input, or use your own
            showSenderName // show the name of the user who sent the message
            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
            // JSON: Custom bubble styles
            bubbleStyles={{
                text: {fontSize: 30},
                chatbubble: {
                    borderRadius: 70,
                    padding: 40
                }
            }}
        />
    )
}