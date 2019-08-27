import {Event, EventOptions} from 'klasa'
import { ApplyOptions } from '../lib';

@ApplyOptions<EventOptions>({
    event: 'ready',
    once: true
})
export default class extends Event {
    
}