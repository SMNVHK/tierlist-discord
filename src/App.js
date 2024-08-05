import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem('tierListItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tierListItems', JSON.stringify(items));
  }, [items]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceItems = [...items[source.droppableId]];
    const destItems = [...items[destination.droppableId]];
    const [reorderedItem] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, reorderedItem);
      setItems({
        ...items,
        [source.droppableId]: sourceItems,
      });
    } else {
      destItems.splice(destination.index, 0, reorderedItem);
      setItems({
        ...items,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
    }
  };

  const addItem = () => {
    if (newItem.trim() !== '') {
      setItems({
        ...items,
        unranked: [...items.unranked, newItem.trim()],
      });
      setNewItem('');
    }
  };

  const tierColors = {
    S: 'bg-red-500',
    A: 'bg-orange-300',
    B: 'bg-yellow-300',
    C: 'bg-green-600',
    D: 'bg-blue-400',
    E: 'bg-pink-300',
    F: 'bg-purple-400',
    unranked: 'bg-gray-300',
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">Discord Tier List</h1>
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 mr-2 rounded"
          placeholder="Add new item"
        />
        <button onClick={addItem} className="bg-blue-500 text-white p-2 rounded">
          Add Item
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(items).map(([tier, tierItems]) => (
          <div key={tier} className="mb-4">
            <div className={`flex items-center ${tierColors[tier]} p-2 rounded-t-lg`}>
              <span className="font-bold text-white text-xl w-10">{tier}</span>
            </div>
            <Droppable droppableId={tier} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap bg-gray-200 p-2 min-h-[50px] rounded-b-lg"
                >
                  {tierItems.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white m-1 p-2 rounded shadow"
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