import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import './App.css';
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

const initialTiers = {
  S: [], A: [], B: [], C: [], D: [], E: [], F: [], unranked: []
};

function App() {
  const [items, setItems] = useState(initialTiers);
  const [newItemText, setNewItemText] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [zoomedItemId, setZoomedItemId] = useState(null);

  useEffect(() => {
    const itemsRef = ref(database, 'items');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mergedData = { ...initialTiers, ...data };
        setItems(mergedData);
      } else {
        setItems(initialTiers);
        set(itemsRef, initialTiers);
      }
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const newItems = { ...items };
    const [reorderedItem] = newItems[source.droppableId].splice(source.index, 1);
    newItems[destination.droppableId].splice(destination.index, 0, reorderedItem);
    
    setItems(newItems);
    set(ref(database, 'items'), newItems);
  };

  const addNewItem = () => {
    if (newItemText.trim() === '' && newItemImage.trim() === '') return;

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newItemText,
      image: newItemImage.trim() || null
    };

    const newItems = {...items, unranked: [...items.unranked, newItem]};
    setItems(newItems);
    set(ref(database, 'items'), newItems);

    setNewItemText('');
    setNewItemImage('');
  };

  const resetTierList = () => {
    setItems(initialTiers);
    set(ref(database, 'items'), initialTiers);
  };

  const tierColors = {
    S: '#ff7f7f', A: '#ffbf7f', B: '#ffdf7f', C: '#ffff7f',
    D: '#bfff7f', E: '#7fff7f', F: '#7fffff', unranked: '#e0e0e0',
  };

  return (
    <div className="App">
      <div className="tier-list">
        <h1>Discord Tier List</h1>
        
        <div className="add-item-form">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Enter item text"
          />
          <input
            type="text"
            value={newItemImage}
            onChange={(e) => setNewItemImage(e.target.value)}
            placeholder="Enter image URL (optional)"
          />
          <button onClick={addNewItem}>Add Item</button>
          <button onClick={resetTierList} className="reset-button">Reset Tier List</button>
        </div>

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
                            className={`tier-item ${zoomedItemId === item.id ? 'zoomed' : ''}`}
                            onMouseEnter={() => setZoomedItemId(item.id)}
                            onMouseLeave={() => setZoomedItemId(null)}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.content} className="item-image" />
                            ) : (
                              item.content
                            )}
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
    </div>
  );
}

export default App;