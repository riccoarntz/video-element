import VideoElement from '../../src/lib/VideoElement';

export default class VideoPlayer {
  private videoPlayer!: VideoElement;
  private timeElement!: HTMLElement;

  constructor(element: HTMLElement) {
    let duration: number = 0;
    let currentTime: number = 0;
    this.timeElement = element.querySelector('.js-time');

    this.videoPlayer = new VideoElement(<HTMLElement>element.querySelector('.js-player'), {
      preloadWithXHR: false,
      loop: false,
      muted: false,
      requireClickListener: true,
    });

    const seekForward: HTMLElement = element.querySelector('.js-seek-positive');
    const seekBackward: HTMLElement = element.querySelector('.js-seek-negative');
    const playButton: HTMLElement = element.querySelector('.js-play');

    playButton.addEventListener('click', () => {
      if (this.videoPlayer.isPlaying) {
        this.videoPlayer.pause();
      } else {
        this.videoPlayer.play();
      }
    });
    seekForward.addEventListener('click', () => {
      this.videoPlayer.seek(currentTime + 1);
    });
    seekBackward.addEventListener('click', () => {
      this.videoPlayer.seek(currentTime - 1);
    });

    element.classList.add('is-loading');
    this.videoPlayer
      .setSrc({
        src: `static/video.mp4`,
      })
      .then(() => {
        element.classList.remove('is-loading');

        this.videoPlayer.play();

        this.videoPlayer.getDuration().then(value => {
          duration = value;
          this.updateTime(currentTime, duration);
        });
      });

    this.videoPlayer.element.addEventListener('timeupdate', () => {
      currentTime = this.videoPlayer.element.currentTime;
      this.updateTime(currentTime, duration);
    });
  }

  private updateTime(currentTime: number, duration: number): void {
    this.timeElement.innerHTML = `${currentTime}/${duration}`;
  }
}
