export interface IVideoElementOptions {
  /**
   * @description: will preload the video completely with a XHR-request and stores the blob in a variable in case it's requested a 2nd time later
   */
  preloadWithXHR?: boolean;
  /**
   * @description: ['auto', 'metadata', 'none'], allows the player to use the native/default html5 preload attribute.
   */
  preloadAttribute?: string;
  /**
   * @description: allows the player to loop
   */
  loop?: boolean;
  /**
   * @description: allows the player to muted
   */
  muted?: boolean;
  /**
   * @description: allows the video-player to play inline
   */
  playsInline?: boolean;
  /**
   * @description: fix/workaround for autoplaying a video with sound. This will attach a click-listener to the window which will do a play and pause directly. After this click is catched we can auto-play/call the play-method directly to any video within this instance
   */
  requireClickListener?: boolean;
}
