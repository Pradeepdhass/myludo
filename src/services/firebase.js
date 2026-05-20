// Firebase Integration Service for Online Ludo Game
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.analytics = null;
    this.config = null;
  }

  // Retrieve firebase config from env or local storage
  getFirebaseConfig() {
    // Check local storage first (gives users UI-driven override)
    const stored = localStorage.getItem('ludo_firebase_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse stored Firebase config:", e);
      }
    }

    // Default configuration provided by user
    const defaultUserConfig = {
      apiKey: "AIzaSyDocqxFKldaBIRVmthIarv8Hfk5ATlJV6Y",
      authDomain: "ludo-king-8396e.firebaseapp.com",
      projectId: "ludo-king-8396e",
      storageBucket: "ludo-king-8396e.firebasestorage.app",
      messagingSenderId: "36318996820",
      appId: "1:36318996820:web:fc3c92f6bd36d5b49ec0c1",
      measurementId: "G-VZ0F9S7RN4"
    };

    // Fallback to Vite env variables if default is overridden
    const envConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultUserConfig.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultUserConfig.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultUserConfig.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultUserConfig.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultUserConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultUserConfig.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultUserConfig.measurementId
    };

    if (envConfig.apiKey && envConfig.projectId) {
      return envConfig;
    }

    return null;
  }

  // Try to initialize firebase
  init() {
    if (this.db) return true; // Already initialized

    const config = this.getFirebaseConfig();
    if (!config) {
      return false;
    }

    try {
      this.config = config;
      // Prevent initializing multiple apps
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }
      this.db = getFirestore(this.app);

      // Initialize Analytics safely (in case ad-blockers block the scripts)
      try {
        if (config.measurementId) {
          this.analytics = getAnalytics(this.app);
        }
      } catch (analyticsError) {
        console.warn("Firebase Analytics failed to initialize (could be blocked by browser extensions):", analyticsError);
      }

      console.log("Firebase initialized successfully with Project ID:", config.projectId);
      return true;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return false;
    }
  }

  isAvailable() {
    return this.init();
  }

  saveConfig(newConfig) {
    if (newConfig) {
      localStorage.setItem('ludo_firebase_config', JSON.stringify(newConfig));
    } else {
      localStorage.removeItem('ludo_firebase_config');
    }
    // Force re-init on next call
    this.app = null;
    this.db = null;
    return this.init();
  }

  // Create a new room
  async createRoom(roomId, playerColor, playerName, playerId) {
    if (!this.init()) throw new Error("Firebase not initialized");

    const roomRef = doc(this.db, 'rooms', roomId);
    const initialPositions = {
      yellow: [-1, -1, -1, -1],
      green: [-1, -1, -1, -1],
      red: [-1, -1, -1, -1],
      blue: [-1, -1, -1, -1]
    };

    const initialRoomData = {
      roomId,
      gameState: 'lobby', // 'lobby', 'playing', 'finished'
      players: [
        {
          id: playerId,
          name: playerName,
          color: playerColor,
          isHost: true,
          joinedAt: new Date().toISOString()
        }
      ],
      turn: 'yellow', // Always starts with yellow in standard Ludo
      diceValue: 1,
      diceState: 'idle', // 'idle', 'rolling', 'rolled'
      rolledSixCount: 0,
      hasPendingMove: false,
      positions: initialPositions,
      finishedPlayers: [],
      lastAction: {
        type: 'create',
        player: playerColor,
        timestamp: new Date().toISOString(),
        summary: `${playerName} created room ${roomId}`
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(roomRef, initialRoomData);
    return initialRoomData;
  }

  // Join an existing room
  async joinRoom(roomId, playerColor, playerName, playerId) {
    if (!this.init()) throw new Error("Firebase not initialized");

    const roomRef = doc(this.db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const roomData = roomSnap.data();

    if (roomData.gameState !== 'lobby') {
      throw new Error("Game has already started in this room");
    }

    // Resolve player color: if 'random' or already taken, select a random available color
    let finalColor = playerColor;
    const takenColors = roomData.players.filter(p => p.id !== playerId).map(p => p.color);
    const existingPlayer = roomData.players.find(p => p.id === playerId);
    
    if (existingPlayer) {
      // Keep their existing color if they are just re-joining/refreshing
      finalColor = existingPlayer.color;
    } else if (finalColor === 'random' || takenColors.includes(finalColor)) {
      const availableColors = ['yellow', 'green', 'red', 'blue'].filter(c => !takenColors.includes(c));
      if (availableColors.length === 0) {
        throw new Error("Room is full (max 4 players)");
      }
      finalColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    // Check if room is full
    if (roomData.players.length >= 4 && !existingPlayer) {
      throw new Error("Room is full (max 4 players)");
    }

    // Update players list
    let updatedPlayers = [...roomData.players];
    const playerIdx = updatedPlayers.findIndex(p => p.id === playerId);

    const playerObj = {
      id: playerId,
      name: playerName,
      color: finalColor,
      isHost: playerIdx >= 0 ? updatedPlayers[playerIdx].isHost : false,
      joinedAt: new Date().toISOString()
    };

    if (playerIdx >= 0) {
      // Update existing player profile
      updatedPlayers[playerIdx] = playerObj;
    } else {
      // Add new player
      updatedPlayers.push(playerObj);
    }

    const updateData = {
      players: updatedPlayers,
      lastAction: {
        type: 'join',
        player: finalColor,
        timestamp: new Date().toISOString(),
        summary: `${playerName} joined the room`
      },
      updatedAt: serverTimestamp()
    };

    await updateDoc(roomRef, updateData);
    return { ...roomData, ...updateData };
  }

  // Listen to live room updates
  listenToRoom(roomId, onUpdate, onError) {
    if (!this.init()) {
      if (onError) onError(new Error("Firebase not initialized"));
      return () => {};
    }

    const roomRef = doc(this.db, 'rooms', roomId);
    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data());
      } else {
        if (onError) onError(new Error("Room not found"));
      }
    }, (error) => {
      console.error("Room snapshot listening error:", error);
      if (onError) onError(error);
    });
  }

  // Push full or partial game state changes
  async updateRoom(roomId, updateData) {
    if (!this.init()) throw new Error("Firebase not initialized");

    const roomRef = doc(this.db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  }

  // Delete a room from database
  async deleteRoom(roomId) {
    if (!this.init()) throw new Error("Firebase not initialized");
    const roomRef = doc(this.db, 'rooms', roomId);
    await deleteDoc(roomRef);
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
