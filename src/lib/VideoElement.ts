import DisposableManager from 'seng-disposable-manager/lib/DisposableManager';
import EventDispatcher from 'seng-event';
import { DisposableEventListener } from 'seng-disposable-event-listener';
import LoadVideoTask from 'task-loader/lib/task/LoadVideoTask';
import VideoEvent from './data/event/VideoEvent';
import { IVideoElementOptions } from './data/interface/IVideoElementOptions';
import { VideoPreloadValue } from './data/enum/VideoPreloadValue';
import { IVideo } from './data/interface/IVideo';

export default class VideoElement extends EventDispatcher {
  public static NO_XHR_PRELOAD_SUPPORT: boolean = false;
  private static DURATION_INTERVAL: string = 'duration-interval';

  private intervals: { [key: string]: any } = {};
  public container: HTMLElement | null;
  public element: HTMLVideoElement | null;
  private duration: number = 0;
  private currentTime: number = 0;
  private animationFrame: any;

  // private hasClickInteraction: boolean = false;
  private clickInteractionEventListener: DisposableEventListener | null;
  private canPlayListener: DisposableEventListener | null;
  private handleCanPlayPromise: Function | null;
  private onTick: any;
  private disposableManager: DisposableManager = new DisposableManager();

  public isPlaying: boolean = false;
  private preloadedVideos: { [src: string]: string } = {};
  private options: IVideoElementOptions = {
    preloadWithXHR: false,
    playsInline: true,
    loop: false,
    muted: false,
    preloadAttribute: VideoPreloadValue.NONE,
    requireClickListener: true,
  };

  constructor(container: HTMLElement, options?: IVideoElementOptions) {
    super();

    this.options = Object.assign(this.options, options);

    this.container = container;
    this.element = document.createElement('video');
    this.element.width = 640;
    this.element.height = 360;
    this.element.muted = this.options.muted || false;
    this.element.preload = this.options.preloadAttribute || VideoPreloadValue.NONE;
    this.element.loop = this.options.loop || false;

    if (this.options.playsInline) {
      this.element.setAttribute('playsinline', 'true');
    }

    this.container.appendChild(this.element);

    this.onTick = this.tick.bind(this);

    if (this.options.requireClickListener) {
      this.clickInteractionEventListener = new DisposableEventListener(
        window,
        'click',
        this.handleClickInteraction.bind(this),
        true,
      );
    }

    this.disposableManager.add(
      new DisposableEventListener(this.element, 'play', this.updatePlayingState.bind(this, true)),
    );

    this.disposableManager.add(
      new DisposableEventListener(this.element, 'pause', this.updatePlayingState.bind(this, false)),
    );

    this.disposableManager.add(
      new DisposableEventListener(this.element, 'ended', this.onVideoEnded.bind(this)),
    );
  }

  private onVideoEnded() {
    this.updatePlayingState(false);

    if (this.options.onEnded) {
      this.options.onEnded();
    }
  }

  /**
   * @private
   * @method updatePlayingState
   */
  private updatePlayingState(isPlaying: boolean): void {
    this.isPlaying = isPlaying;

    if (this.options.onPlaying) {
      this.options.onPlaying(this.isPlaying);
    }

    if (isPlaying) {
      this.tick();
    }
  }

  private tick() {
    if (this.isPlaying) {
      this.animationFrame = requestAnimationFrame(this.onTick);
    }
    const currentTime = this?.element?.currentTime || 0;
    if (currentTime !== this.currentTime) {
      this.currentTime = currentTime;

      if (this.options.onTimeUpdate) {
        this.options.onTimeUpdate(this.currentTime, this.duration);
      }
    }
  }

  /**
   * @public
   * @method updateSource
   * @returns {void}
   */
  public play(): void {
    if (this.element) {
      // if (this.options.requireClickListener && !this.hasClickInteraction) {
      //   return;
      // }

      this.element.play();
    }
  }

  /**
   * @public
   * @description: Will restart the video at a currentTime of 0.
   * @method replay
   */
  public replay(): void {
    this.pause();
    this.seek(0);
    this.play();
  }

  /**
   * @public
   * @description: Will toggle the play/pause state
   * @method togglePlay
   */
  public togglePlay(): void {
    this.isPlaying ? this.pause() : this.play();
  }

  /**
   * @public
   * @method progress
   */
  public seek(time: number): void {
    if (this.element) {
      this.element.currentTime = time;
    }
  }

  /**
   * @public
   * @description: allows a number between [0-1].
   * @method progress
   */
  public progress(progress: number): void {
    if (this.element) {
      this.element.currentTime = progress * this.element.duration;
    }
  }
  /**
   * @public
   * @description: Sometimes the duration method is called too soon for the API and it returns `NaN`. This method is
   * a work-around then will run an interval until the API is ready for returning it's actual duration.
   * @method getDuration
   */
  public getDuration(): Promise<number> {
    return new Promise((resolve: Function) => {
      this.clearInterval(VideoElement.DURATION_INTERVAL);
      this.intervals[VideoElement.DURATION_INTERVAL] = setInterval(() => {
        if (this.element && this.element.duration > 0) {
          this.duration = this.element.duration;
          this.clearInterval(VideoElement.DURATION_INTERVAL);
          resolve(this.duration);
        }
      }, 60);
    });
  }

  /**
   * @public
   * @method pause
   * @returns {void}
   */
  public pause(): void {
    if (this.element) {
      this.element.pause();
    }
  }

  /**
   * @public
   * @description: the setSrc method is resolved when the video is fully preloaded(preloadWithXHR), or when it's native canplay event is triggered
   * @method set src
   */
  public setSrc(
    video: IVideo,
    preloadWithXHR: boolean = this.options.preloadWithXHR || false,
    srcObject: boolean = false,
  ): Promise<Array<any>> {
    this.currentTime = 0;
    this.duration = 0;
    this.updatePlayingState(false);

    if (this.element) {
      // Set poster
      if (video.poster) {
        this.element.poster = video.poster;
      }

      let preloadedVideo = null;

      // Check if the file has been preloaded before
      if (!srcObject) {
        preloadedVideo = this.preloadedVideos[<string>video.src];
      }

      if (!preloadedVideo && preloadWithXHR && !srcObject) {
        // Return when ready
        return Promise.all([
          // this.getDuration(),
          this.preload(video).then(() => {
            if (this.element) {
              // Pre-loading videos and setting the blob as a source *might* not work in certain browser, so we use
              // the original
              // source
              this.element.src = VideoElement.NO_XHR_PRELOAD_SUPPORT
                ? <string>video.src
                : this.preloadedVideos[<string>video.src];

              this.getDuration();
            }
          }),
        ]);
      }

      // Remove canPlayListener before assigning a new one
      if (this.canPlayListener) {
        this.canPlayListener.dispose();
        this.canPlayListener = null;
      }

      this.canPlayListener = new DisposableEventListener(
        this.element,
        'canplay',
        this.handleCanPlay.bind(this),
      );

      // Stop before switching the source
      this.pause();

      // Pre-loading videos and setting the blob as a source *might* not work in certain browser, so we use the original
      // source
      if (srcObject) {
        this.element.srcObject = <MediaStream>video.src;
      } else {
        this.element.src = VideoElement.NO_XHR_PRELOAD_SUPPORT
          ? video.src
          : preloadedVideo || video.src;
        this.getDuration();
      }

      this.element.load();

      // Return when ready
      return Promise.all([
        // this.getDuration(),
        new Promise((resolve: Function) => {
          this.handleCanPlayPromise = resolve;
        }),
      ]);
    }

    return Promise.reject(`no video element set`);
  }

  /**
   * @private
   * @method handleCanPlay
   */
  private handleCanPlay(): void {
    if (this.handleCanPlayPromise && this.element) {
      this.handleCanPlayPromise();
      this.handleCanPlayPromise = null;
    }
  }

  /**
   * @private
   * @method preload
   * @returns {Promise<void>}
   */
  private preload(video: IVideo): Promise<void> {
    if (typeof video.src === 'string') {
      const loadVideoTask = new LoadVideoTask({
        assets: video.src,
        onAssetLoaded: ({ asset }) => {
          this.preloadedVideos[<string>video.src] = asset;
        },
      });

      return loadVideoTask.load().then(() => {
        loadVideoTask.dispose();
      });
    }
    return Promise.resolve();
  }

  /**
   * @private
   * @method clearInterval
   */
  private clearInterval(id: string): void {
    if (this.intervals[id]) {
      clearInterval(this.intervals[id]);
    }
  }

  /**
   * @method handleClickInteraction
   * @description User interaction allows for auto play on the audio element!
   */
  private handleClickInteraction() {
    // this.hasClickInteraction = true;

    if (!this.isPlaying) {
      this.play();
      this.pause();
    }

    this.removeClickInteractionListener();
  }

  /**
   * @public
   * @method removeClickInteractionListener
   */
  public removeClickInteractionListener(): void {
    if (this.clickInteractionEventListener) {
      this.clickInteractionEventListener.dispose();
      this.clickInteractionEventListener = null;
    }

    this.dispatchEvent(new VideoEvent(VideoEvent.CLICK_INTERACTION_CLICK, {}));
  }

  /**
   * @public
   * @method dispose
   * @returns {void}
   */
  public dispose(): void {
    this.pause();
    this.removeClickInteractionListener();

    this.clearInterval(VideoElement.DURATION_INTERVAL);

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.disposableManager.dispose();

    if (this.canPlayListener) {
      this.canPlayListener.dispose();
      this.canPlayListener = null;
    }

    if (this.container) {
      this.container = null;
    }

    this.element = null;

    super.dispose();
  }
}
