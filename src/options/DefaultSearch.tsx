// eslint-disable-next-line import/no-extraneous-dependencies
import Fuse from 'fuse.js';

export default function defaultSearch(options: any) {
    const fuse = new Fuse(options, {
        keys: ['name', 'groupName', 'items.name'],
        threshold: 0.3,
        useExtendedSearch: true,
    });

    return (value: any) => {
        if (!value.length) {
            return options;
        }

        return fuse.search("^" + value).map(({ item }) => item);
    };
}