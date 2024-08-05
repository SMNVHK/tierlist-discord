import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import firebase from 'firebase/app';
import 'firebase/database';
import './TierList.css';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {

  apiKey: "AIzaSyDCt4bLWo8OVYb7dO5Cjyin6VKa9czjuoo",

  authDomain: "bot-discord-c13ff.firebaseapp.com",

  databaseURL: "https://bot-discord-c13ff-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "bot-discord-c13ff",

  storageBucket: "bot-discord-c13ff.appspot.com",

  messagingSenderId: "276543551497",

  appId: "1:276543551497:web:882ebf4a639941e77da0d8",

  measurementId: "G-854G1PH0RF"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

const TierList = () => {
  const [items, setItems] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    unranked: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  });

  useEffect(() => {
    const itemsRef = database.ref('items');
    itemsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setItems(data);
      }
    });

    return () => {
      itemsRef.off();
    };
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newItems = { ...items };
    const [reorderedItem] = newItems[source.droppableId].splice(source.index, 1);
    newItems[destination.droppableId].splice(destination.index, 0, reorderedItem);

    setItems(newItems);
    database.ref('items').set(newItems);
  };

  const tierColors = {
    S: '#ff7f7f',
    A: '#ffbf7f',
    B: '#ffdf7f',
    C: '#ffff7f',
    D: '#bfff7f',
    E: '#7fff7f',
    F: '#7fffff',
    unranked: '#e0e0e0',
  };

  return (
    <div className="tier-list">
      <h1>Discord Tier List</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(items).map(([tier, tierItems]) => (
          <div key={tier} className="tier">
            <div className="tier-label" style={{ backgroundColor: tierColors[tier] }}>
              {tier}
            </div>
            <Droppable droppableId={tier} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="tier-items"
                >
                  {tierItems.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="tier-item"
                        >
                          {item}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default TierList;