import React from 'react'
import { GiftedChat } from 'react-native-gifted-chat'

import example_messages from './messages'

export default class Example extends React.Component {
  state = {
    messages: [],
  }

  componentWillMount() {
    this.setState({
      messages: example_messages
    })
  }

  onSend(messages = []) {
    console.log(messages) 
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    )
  }
}