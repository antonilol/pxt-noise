namespace noise {
    function overflow(numb: number): number {
        let c = (numb % (2 ** 32))
        if (c> 2 ** 31){
            c -= 2 ** 32
        }
        return c
    }
    let STRETCH_CONSTANT_2D = -0.211324865405187    //# (1 / Math.sqrt(2 + 1) - 1) / 2
    let SQUISH_CONSTANT_2D = 0.366025403784439      //# (Math.sqrt(2 + 1) - 1) / 2
    let STRETCH_CONSTANT_3D = -1.0 / 6              //# (1 / Math.sqrt(3 + 1) - 1) / 3
    let SQUISH_CONSTANT_3D = 1.0 / 3                //# (Math.sqrt(3 + 1) - 1) / 3
    let STRETCH_CONSTANT_4D = -0.138196601125011    //# (1 / Math.sqrt(4 + 1) - 1) / 4
    let SQUISH_CONSTANT_4D = 0.309016994374947      //# (Math.sqrt(4 + 1) - 1) / 4

    let NORM_CONSTANT_2D = 47
    let NORM_CONSTANT_3D = 103
    let NORM_CONSTANT_4D = 30

    let DEFAULT_SEED = 0

    let GRADIENTS_2D = [
        5, 2, 2, 5,
        -5, 2, -2, 5,
        5, -2, 2, -5,
        -5, -2, -2, -5,
    ]
    console.log("" + overflow(54571696571695726591))
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
