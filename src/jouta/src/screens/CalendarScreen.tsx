import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage, type Task, type Journal } from '../services/storage';

type Item = { type: 'task'; } & Task | { type: 'journal'; } & Journal;

export default function CalendarScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      const [tasks, journals] = await Promise.all([
        storage.getTasks(),
        storage.getJournals(),
      ]);

      const combinedItems: Item[] = [
        ...tasks.map(task => ({ ...task, type: 'task' as const })),
        ...journals.map(journal => ({ ...journal, type: 'journal' as const })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(combinedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await storage.updateTask(updatedTask);
      await loadItems();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (item: Item) => {
    try {
      if (item.type === 'task') {
        await storage.deleteTask(item.id);
      } else {
        await storage.deleteJournal(item.id);
      }
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isTask = item.type === 'task';
    const itemDate = new Date(item.createdAt);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <MaterialCommunityIcons
            name={isTask ? 'checkbox-blank-circle-outline' : 'book-open-variant'}
            size={24}
            color="white"
          />
          <Text style={styles.itemDate}>
            {itemDate.toLocaleDateString()} {itemDate.toLocaleTimeString()}
          </Text>
        </View>
        
        <Text style={styles.itemText}>{item.text}</Text>
        
        {isTask && (
          <View style={styles.taskDetails}>
            <Text style={[styles.priorityTag, styles[`priority${item.priority}` as keyof typeof styles]]}>
              {item.priority}
            </Text>
            <Text style={styles.dueDate}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.itemActions}>
          {isTask && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleTask(item)}
            >
              <MaterialCommunityIcons
                name={item.completed ? 'check-circle' : 'circle-outline'}
                size={24}
                color={item.completed ? '#4CAF50' : 'white'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
    paddingTop: 80,
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
    fontSize: 12,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  prioritylow: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  prioritymedium: {
    backgroundColor: '#FFC107',
    color: 'black',
  },
  priorityhigh: {
    backgroundColor: '#FF5252',
    color: 'white',
  },
  dueDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 