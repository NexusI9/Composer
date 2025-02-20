export const mapKeys = (reference: any, mutable: any) => {

    Object.keys(reference).forEach(key => {
        try {
            //round potential floats
            mutable[key as keyof typeof reference] = reference[key as keyof typeof mutable];
        } catch (e) {
            //console.warn(`Couldn't assign attribute for ${key}`);
        }
    });
}
