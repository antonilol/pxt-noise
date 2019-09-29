namespace noise {
    function overflow(numb:number):number{
        let output=0
        let pre:number[]
        for (let index = 0; index <= 31; index++) {
            if (numb >= 2 ** (31 - index)) {
                numb += -1 * 2 ** (31 - index)
                pre.push(1)                
            } else {
                pre.push(0)
            }
        }

        return output
    }
    console.log(""+overflow(6))
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
