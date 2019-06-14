import { PermissionLevels, KlasaMessage } from 'klasa';

export namespace Constants {
    export const permissionLevels = new PermissionLevels()
        .add(0, (): boolean => false)
        .add(10, ({ client, author }: KlasaMessage): boolean => client.owners.has(author!));
}