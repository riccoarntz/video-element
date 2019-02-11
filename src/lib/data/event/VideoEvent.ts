import AbstractEvent from 'seng-event/lib/AbstractEvent';
import { generateEventTypes, EVENT_TYPE_PLACEHOLDER } from 'seng-event/lib/util/eventTypeUtils';

class VideoEvent extends AbstractEvent {
  public data: any;
  public static CLICK_INTERACTION_CLICK: string = EVENT_TYPE_PLACEHOLDER;

  constructor(
    type: string,
    data: any,
    bubbles?: boolean,
    cancelable?: boolean,
    setTimeStamp?: boolean,
  ) {
    super(type, bubbles, cancelable, setTimeStamp);
    this.data = data;
  }

  public clone(): VideoEvent {
    return new VideoEvent(this.type, this.data, this.bubbles, this.cancelable);
  }
}

generateEventTypes({ VideoEvent });

export default VideoEvent;
