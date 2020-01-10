import React, { useState, useEffect, useRef } from 'react';
import {
    MessageList,
    Input,
    Button,
} from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

/* [firestore init start] */
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { config, secondaryConfig } from '../firebase_auth'

//const testMessages = JSON.parse(JSON.stringify({ "coachAvatar": "https://www.telegraph.co.uk/content/dam/football/2016/05/26/livvy1_trans_NvBQzQNjv4BqqVzuuqpFlyLIwiB6NTmJwfSVWeZ_vEN7c6bHu2jJnT8.jpg?imwidth=450", "coachName": "Dr. Phill", "last10": [{ "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "notch": false, "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Test", "time": { "seconds": 1572736146.927 }, "type": "text" }, { "isCoach": true, "name": "Coach", "text": "Hello", "time": { "seconds": 1572653851.824 }, "type": "text" }, { "isCoach": false, "name": "Patient", "text": "Hi", "time": { "seconds": 1572653634.143 }, "type": "text" }], "lastCoach": { "seconds": 1572736146, "nanoseconds": 928000000 }, "lastPatient": { "seconds": 1572653851, "nanoseconds": 824000000 }, "patientAvatar": "https://yt3.ggpht.com/a/AGF-l7_-5IC3y7gJRI981islTaeIBZNMgyl3JG4G8w=s48-c-k-c0xffffffff-no-rj-mo", "patientName": "Bobby Diabests" }))

const useFirestoreDoc = (ref) => {
    /*  useFireStoreDoc (firebase refrense => hooked* data) *not correct term
    creates hooks connected to an onSnapshot listener
    if data in Firestore changes for this document then docState will update
    from https://medium.com/@sampsonjoliver/firebase-meet-react-hooks-db589c625106 */
    const [docState, setDocState] = useState({
        isLoading: true,
        messageMetadata: null
    });

    useEffect(() => {
        return ref.onSnapshot(doc => {
            const messageMetadata = doc.data()
            console.log('testdata', JSON.stringify(messageMetadata))
            setDocState({
                isLoading: false,
                messageMetadata
            });
        });
    }, []);

    return docState;
}


firebase.initializeApp(config);
//firebase.auth().signInWithEmailAndPassword('test@test.com','password').then(()=>console.log('signed in.'))


var secondary = firebase.initializeApp(secondaryConfig, 'secondary');
secondary.auth().signInWithEmailAndPassword('test@test.com', 'password').then(() => console.log('signed in.'))

/* [firestore init end] */

function App() {
    const patientId = 'up1t5V8VAIS4I2qlmcKM'
    const ref = firebase.firestore().collection('Messaging').doc(patientId)
    const { isLoading, messageMetadata } = useFirestoreDoc(ref)

    const [draftMessage, setDraftMessage] = useState('')
    const inputRef = useRef(null)

    function renderMessages(messageData) {
        /* renderMessages (list of objects => list of objects)
        parses document data to be usable by the UI
        orders by time and restructures objects
        */
        if (messageData === undefined)
            return []

        const coachAvatar = messageData.coachAvatar
        const patientAvatar = messageData.patientAvatar

        if (messageData.last10 === undefined)
            return []

        return messageData.last10.sort((a, b) => (a.time.seconds > b.time.seconds) ? 1 : -1)
            .map((mess) => {
                console.log('time', mess.time, mess.time.seconds)
                return {
                    type: 'text',
                    position: (mess.isCoach ? 'right' : 'left'),
                    title: mess.name,
                    titleColor: (mess.isCoach ? 'gray' : 'blue'),
                    text: mess.text,
                    date: new Date(mess.time.seconds * 1000),
                    avatar: (mess.isCoach ? coachAvatar : patientAvatar)
                }
            })
    }

    function onInputChange(t) {
        console.log('send text', t.target.value)
        setDraftMessage(t.target.value)
    }

    function shiftMessageArray(draftObj) {
        // takes message array, appdends draft removes the oldest message
        if (messageMetadata === undefined)
            return []
        if (messageMetadata.last10 === undefined)
            return [draftObj]

        let newLast10 = messageMetadata.last10

        newLast10.push(draftObj)
        return newLast10
            .sort((a, b) => (a.time.seconds < b.time.seconds) ? 1 : -1) //TODO handle time more gracefully
            .slice(0, 10)
    }

    function onSend() {
        // send message using firebase
        // two part batched write:
        // (1) sets an updated last10 with the new message
        // (2) - set new message document
        var db = firebase.firestore()
        const metadataRef = db.collection('Messaging').doc(patientId)
        const messageRef = db.collection('Messaging').doc(patientId)
            .collection('all').doc()

        const draftMessageObj = {
            text: draftMessage,
            name: messageMetadata.name || 'Coach',
            type: 'text',
            isCoach: true,
            time: { seconds: new Date() / 1000 } //TODO handle time more gracefully
        }
        const newLast10 = shiftMessageArray(draftMessageObj)
        const draftMetadataObj = {
            last10: newLast10,
            lastPatient: new Date(),
        }

        console.log('newLast10', newLast10)
        var batch = db.batch();
        batch.update(metadataRef, draftMetadataObj); // (1)
        batch.set(messageRef, draftMessageObj); // (2)
        batch.commit().then(() => console.log('successful batch write'))
    }

    if (isLoading)
        return (<p>Messages updating</p>)
    return (
        <div className='container'>
            <div className='right-panel'>
                <MessageList
                    className='message-list'
                    lockable={true} //locks scroll when new item added
                    downbutton
                    //downButtonBadge={10} //number displayed on down button
                    onClick={(e) => console.log('onclick', e)}
                    onDownButtonClick={() => console.log('down button clicked')}
                    dataSource={renderMessages(messageMetadata)} />
                <Input
                    className='input'
                    placeholder="Click here and start typing..."
                    defaultValue=""
                    ref={inputRef}
                    multiline={true}
                    onChange={onInputChange}
                    // buttonsFloat='left'
                    onKeyPress={(e) => {
                        if (e.shiftKey && e.charCode === 13) {
                            return true;
                        }
                        if (e.charCode === 13) {
                            inputRef.current.clear();
                            onSend();
                            e.preventDefault();
                            return false;
                        }
                    }}
                    rightButtons={
                        <Button
                            className='button-send'
                            text='Send'
                            onClick={() => {
                                inputRef.current.clear();
                                onSend()
                            }} />
                    } />
            </div>
        </div>
    );
}

export default App;