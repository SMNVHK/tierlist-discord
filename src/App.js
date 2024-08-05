import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import './TierList.css';

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const initialItems = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  E: [],
  F: [],
  unranked: [
    { id: 'item1', content: 'Item 1' },
    { id: 'item2', content: 'Item 2' },
    { id: 'item3', content: 'Item 3' },
    { id: 'item4', content: 'Item 4' },
    { id: 'item5', content: 'Item 5' },
  ],
};

const TierList = () => {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    const itemsRef = ref(database, 'items');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Merge incoming data with existing structure
        const mergedItems = {...initialItems};
        Object.keys(data).forEach(tier => {
          mergedItems[tier] = [...new Set([...mergedItems[tier], ...data[tier]])];
        });
        setItems(mergedItems);
      } else {
        // If no data, initialize with default structure
        set(itemsRef, initialItems);
      }
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const newItems = JSON.parse(JSON.stringify(items));
    
    // Remove from source
    const [reorderedItem] = newItems[source.droppableId].splice(source.index, 1);
    
    // Add to destination
    newItems[destination.droppableId].splice(destination.index, 0, reorderedItem);
    
    // Remove duplicates
    Object.keys(newItems).forEach(tier => {
      newItems[tier] = [...new Set(newItems[tier].map(JSON.stringify))].map(JSON.parse);
    });

    setItems(newItems);
    set(ref(database, 'items'), newItems);
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
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="tier-item"
                        >
                          {item.content}
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