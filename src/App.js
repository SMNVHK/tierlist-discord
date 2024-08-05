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
  S: { name: 'S', items: [] },
  A: { name: 'A', items: [] },
  B: { name: 'B', items: [] },
  C: { name: 'C', items: [] },
  D: { name: 'D', items: [] },
  E: { name: 'E', items: [] },
  F: { name: 'F', items: [] },
  unranked: { name: 'Unranked', items: [] }
};

function App() {
  const [tiers, setTiers] = useState(initialTiers);
  const [newItemText, setNewItemText] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [editingTier, setEditingTier] = useState(null);

  useEffect(() => {
    const tiersRef = ref(database, 'tiers');
    onValue(tiersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTiers(data);
      } else {
        setTiers(initialTiers);
        set(tiersRef, initialTiers);
      }
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const newTiers = JSON.parse(JSON.stringify(tiers));
    const [reorderedItem] = newTiers[source.droppableId].items.splice(source.index, 1);
    newTiers[destination.droppableId].items.splice(destination.index, 0, reorderedItem);
    
    setTiers(newTiers);
    set(ref(database, 'tiers'), newTiers);
  };

  const addNewItem = () => {
    if (newItemText.trim() === '' && newItemImage.trim() === '') return;

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newItemText,
      image: newItemImage.trim() || null
    };

    const newTiers = {...tiers};
    newTiers.unranked.items.push(newItem);
    setTiers(newTiers);
    set(ref(database, 'tiers'), newTiers);

    setNewItemText('');
    setNewItemImage('');
  };

  const resetTierList = () => {
    setTiers(initialTiers);
    set(ref(database, 'tiers'), initialTiers);
  };

  const startEditingTier = (tierId) => {
    setEditingTier(tierId);
  };

  const finishEditingTier = (tierId, newName) => {
    const newTiers = {...tiers};
    newTiers[tierId].name = newName;
    setTiers(newTiers);
    set(ref(database, 'tiers'), newTiers);
    setEditingTier(null);
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
          {Object.entries(tiers).map(([tierId, tier]) => (
            <div key={tierId} className="tier">
              <div 
                className="tier-label" 
                style={{ backgroundColor: tierColors[tierId] }}
                onClick={() => startEditingTier(tierId)}
              >
                {editingTier === tierId ? (
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => finishEditingTier(tierId, e.target.value)}
                    onBlur={() => setEditingTier(null)}
                    autoFocus
                  />
                ) : (
                  tier.name
                )}
              </div>
              <Droppable droppableId={tierId} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="tier-items"
                  >
                    {tier.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="tier-item"
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