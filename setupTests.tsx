import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock Leaflet
vi.mock('leaflet', () => {
  const L = {
    divIcon: vi.fn(() => ({})),
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
      addControl: vi.fn(),
    })),
    control: {
      zoom: vi.fn(() => ({
        addTo: vi.fn(),
      })),
    },
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    polyline: vi.fn(() => ({
      addTo: vi.fn(),
      setLatLngs: vi.fn(),
    })),
    circleMarker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      setLatLng: vi.fn().mockReturnThis(),
    })),
  };
  return {
    default: L,
    ...L,
  };
});

// Mock react-simple-maps
vi.mock('react-simple-maps', () => {
  return {
    ComposableMap: ({ children }: any) => <div data-testid="composable-map">{children}</div>,
    Geographies: ({ children }: any) => <div data-testid="geographies">{children({ geographies: [] })}</div>,
    Geography: () => <div data-testid="geography" />,
    Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
    ZoomableGroup: ({ children }: any) => <div data-testid="zoomable-group">{children}</div>,
  };
});

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    increment: vi.fn((val) => val),
    arrayUnion: vi.fn((val) => [val]),
    onSnapshot: vi.fn((q, cb, errCb) => {
      // Trigger callback with empty docs initial state
      setTimeout(() => {
        if (cb) cb({ docs: [] });
      }, 0);
      return vi.fn(); // unsubscribe mock
    }),
    serverTimestamp: vi.fn(() => new Date().toISOString()),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
    doc: vi.fn(),
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
    setDoc: vi.fn(),
    writeBatch: vi.fn(),
  };
});
