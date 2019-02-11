// import initComponents from 'muban-core/lib/utils/initComponents';
import VideoPlayer from './VideoPlayer';

const render = () => {
  new VideoPlayer(<HTMLElement>document.querySelector('.js-video-element'));
  // componentList.forEach((blockConstructor) => {
  //   registerComponent(blockConstructor);
  // });
  //
  // initComponents(div);
};

document.addEventListener('DOMContentLoaded', () => {
  render();
});
