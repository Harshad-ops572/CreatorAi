declare module 'ffprobe-static' {
  const ffprobeStatic: { path: string };
  export default ffprobeStatic;
}

declare module 'ffmpeg-static' {
  const ffmpegStatic: string;
  export default ffmpegStatic;
}

declare module 'mongodb-memory-server' {
  export const MongoMemoryServer: {
    create: () => Promise<{
      getUri: () => string;
      stop: () => Promise<boolean>;
    }>;
  };
}
