namespace noise {
    function overflow(numb: number): number {
        let output = 0
        let pre: number[] = []
        for (let index = 0; index <= 31; index++) {
            if (numb >= 2 ** (31 - index)) {
                numb += -1 * 2 ** (31 - index)
                pre.push(1)
            } else {
                pre.push(0)
            }
        }
let count=2**31
        for (let v of pre) {
            if (v){
                output+=count
            }
count=count/2
        }

        return output
    }
    console.log("" + overflow(6796209642065140602))
    export function noise2d(seed: number, x: number, y: number): number {
        return 0
    }
    export function noise3d(seed: number, x: number, y: number, z: number): number {
        return 0
    }
    export function noise4d(seed: number, x: number, y: number, z: number, w: number): number {
        return 0
    }
}
