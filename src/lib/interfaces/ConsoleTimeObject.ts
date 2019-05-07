import { ColorsBackgrounds, ColorsStyleTypes } from '../enums';

export interface ConsoleTimeObject {
    background?: keyof typeof ColorsBackgrounds | null;
    style?: keyof typeof ColorsStyleTypes | null;
    text?: keyof typeof ColorsBackgrounds | null;
}