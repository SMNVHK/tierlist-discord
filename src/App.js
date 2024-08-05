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

const TierList = () => {
  const [items, setItems] = useState({
    S: [], A: [], B: [], C: [], D: [], E: [], F: [], unranked: []
  });
  const [newItemText, setNewItemText] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  useEffect(() => {
    const itemsRef = ref(database, 'items');
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dedupedData = deduplicateItems(data);
        setItems(dedupedData);
        // If we deduped anything, update Firebase
        if (JSON.stringify(data) !== JSON.stringify(dedupedData)) {
          set(itemsRef, dedupedData);
        }
      }
    });
  }, []);

  const deduplicateItems = (data) => {
    const dedupedData = {...data};
    const allItems = new Set();
    
    Object.keys(dedupedData).forEach(tier => {
      dedupedData[tier] = dedupedData[tier].filter(item => {
        const itemString = JSON.stringify(item);
        if (allItems.has(itemString)) {
          return false;
        }
        allItems.add(itemString);
        return true;
      });
    });

    return dedupedData;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const newItems = JSON.parse(JSON.stringify(items));
    const [reorderedItem] = newItems[source.droppableId].splice(source.index, 1);
    newItems[destination.droppableId].splice(destination.index, 0, reorderedItem);
    
    const dedupedItems = deduplicateItems(newItems);
    setItems(dedupedItems);
    set(ref(database, 'items'), dedupedItems);
  };

  const addNewItem = () => {
    if (newItemText.trim() === '') return;

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newItemText,
      image: newItemImage.trim() || null
    };

    // Check if item already exists
    const itemExists = Object.values(items).flat().some(
      item => item.content === newItem.content && item.image === newItem.image
    );

    if (!itemExists) {
      const newItems = {...items, unranked: [...items.unranked, newItem]};
      setItems(newItems);
      set(ref(database, 'items'), newItems);
    } else {
      alert("This item already exists in the tier list!");
    }

    setNewItemText('');
    setNewItemImage('');
  };

  // ... (rest of the component remains the same)
};

export default TierList;