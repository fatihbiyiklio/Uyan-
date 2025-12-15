/// <reference types="vite/client" />

interface Window {
    // Global definitions if needed
}

// Media Session API types
interface Navigator {
    mediaSession: MediaSession;
}

interface MediaSession {
    metadata: MediaMetadata | null;
    playbackState: 'none' | 'paused' | 'playing';
    setActionHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null): void;
    setPositionState?(state: MediaPositionState): void;
}

type MediaSessionAction = 'play' | 'pause' | 'seekbackward' | 'seekforward' | 'previoustrack' | 'nexttrack' | 'skipad' | 'stop' | 'seekto' | 'togglemicrophone' | 'togglecamera' | 'hangup';

type MediaSessionActionHandler = (details: MediaSessionActionDetails) => void;

interface MediaSessionActionDetails {
    action: MediaSessionAction;
    seekOffset?: number;
    seekTime?: number;
    fastSeek?: boolean;
}

interface MediaMetadata {
    title: string;
    artist: string;
    album: string;
    artwork: MediaImage[];
}

declare var MediaMetadata: {
    prototype: MediaMetadata;
    new(init?: MediaMetadataInit): MediaMetadata;
};

interface MediaMetadataInit {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: MediaImage[];
}

interface MediaImage {
    src: string;
    sizes?: string;
    type?: string;
}

interface MediaPositionState {
    duration?: number;
    playbackRate?: number;
    position?: number;
}
