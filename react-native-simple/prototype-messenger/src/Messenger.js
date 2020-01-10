import React from 'react'
import { Text, YellowBox } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import { config } from '../firebase_auth.js'

import example_messages from './messages'

firebase.initializeApp(config);
firebase.auth().signInWithEmailAndPassword('b@test.testicles', 'password').then(() => console.log('signed in.'))
db = firebase.firestore()

export default class Example extends React.Component {
    state = {}

    componentWillMount() {
        YellowBox.ignoreWarnings(['Setting a timer']); //firebase known warning
        this.setState({
            loading: true,
            messages: [],
            last10: [],  //messages from the database
            userName: '',
            patientId: 'up1t5V8VAIS4I2qlmcKM',
        })
    }

    componentDidMount() {
        this.setState({ loading: true })
        const ref = firebase.firestore().collection('Messaging').doc(this.state.patientId)
        this.unsubscribe = ref.onSnapshot(doc => {
            const messageData = doc.data()
            console.log('message data', messageData !== undefined, messageData)
            this.setState({
                loading: false,
                messages: this.renderMessages(messageData),
                last10: (messageData !== undefined ? messageData.last10 : []),
                userName: (messageData !== undefined ? messageData.name : 'Name Not Defined'),
            })
        });
    }

    renderMessages(messageData) {
        /* renderMessages (list of objects => list of objects)
        parses document data to be usable by the UI
        orders by time and restructures objects
        */
        if (messageData === undefined)
            return []

        const last10messages = messageData.last10
        const coachAvatar = messageData.coachAvatar

        if (last10messages === undefined)
            return []

        const messagesUi = last10messages
            .sort((a, b) => (a.time.seconds < b.time.seconds) ? 1 : -1)
            .map((mess, i) => {
                console.log(mess, i)
                return {
                    _id: i,
                    text: mess.text,
                    createdAt: new Date(mess.time.seconds * 1000),
                    user: {
                        _id: (mess.isCoach ? 2 : 1),
                        name: mess.name,
                        avatar: coachAvatar
                    }
                }
            })
        console.log(messagesUi)
        return messagesUi
    }


    shiftMessageArray(draftObj) {
        // takes message array, appdends draft removes the oldest message
        // ensures last10 stays 10 messages long
        if (this.state.last10 === undefined) //if last10 not defined
            return [draftObj]

        let newLast10 = [...this.state.last10]
        newLast10.push(draftObj)
        return newLast10
            .sort((a, b) => (a.time.seconds < b.time.seconds) ? 1 : -1) //TODO handle time more gracefully
            .slice(0, 10)
    }

    onSend(draftMessage) {
        // send message using firebase
        // two part batched write:
        // (1) sets an updated last10 with the new message
        // (2) - set new message document
        var db = firebase.firestore()
        const metadataRef = db.collection('Messaging').doc(this.state.patientId)
        const messageRef = db.collection('Messaging').doc(this.state.patientId)
            .collection('all').doc()

        const draftMessageObj = {
            text: draftMessage,
            name: this.state.userName || 'Patient',
            type: 'text',
            isCoach: false,
            time: { seconds: new Date() / 1000 } //TODO handle time more gracefully
        }
        const newLast10 = this.shiftMessageArray(draftMessageObj)
        const draftMetadataObj = {
            last10: newLast10,
            lastCoach: new Date(),
        }
        console.log('newdraftMessageObj', draftMessageObj)
        console.log('newLast10', JSON.stringify(newLast10))

        this.setState({ loading: true })
        var batch = db.batch();
        batch.update(metadataRef, draftMetadataObj); // (1)
        batch.set(messageRef, draftMessageObj); // (2)
        batch.commit().then(() => this.setState({ loading: false }))
    }

    onSendMessage(messages = []) {
        /* onSendMessage ([message obj])
        extracts text from messages (returned from GiftedChat component's onSend)
        then passes the text onto onSend which uploads it to firestore
        */
        this.onSend(messages[0].text)
    }

    render() {
        if (this.state.loading)
            return (
                <Text style={{ fontSize: 60, alignSelf: 'center' }}>
                    Loading...
                </Text>
            ) //TODO replace with modal/loading spinner

        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={messages => this.onSendMessage(messages)}
                user={{
                    _id: 1,
                }}
            />
        )
    }
}