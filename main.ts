//% color="#53a4b4" block="Noise Functions" weight=100 icon="*"
namespace noise {
    function overflow(numb: number): number {
        let c = (numb % (2 ** 32))
        if (c > (2 ** 31)) {
            c = c - (2 ** 32)
        }
        return c
    }

    let STRETCH_CONSTANT_2D = -0.211324865405187    //// (1 / Math.sqrt(2 + 1) - 1) / 2
    let SQUISH_CONSTANT_2D = 0.366025403784439      //// (Math.sqrt(2 + 1) - 1) / 2
    let STRETCH_CONSTANT_3D = -1.0 / 6              //// (1 / Math.sqrt(3 + 1) - 1) / 3
    let SQUISH_CONSTANT_3D = 1.0 / 3                //// (Math.sqrt(3 + 1) - 1) / 3
    let STRETCH_CONSTANT_4D = -0.138196601125011    //// (1 / Math.sqrt(4 + 1) - 1) / 4
    let SQUISH_CONSTANT_4D = 0.309016994374947      //// (Math.sqrt(4 + 1) - 1) / 4

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
    let GRADIENTS_3D = [
        -11, 4, 4, -4, 11, 4, -4, 4, 11,
        11, 4, 4, 4, 11, 4, 4, 4, 11,
        -11, -4, 4, -4, -11, 4, -4, -4, 11,
        11, -4, 4, 4, -11, 4, 4, -4, 11,
        -11, 4, -4, -4, 11, -4, -4, 4, -11,
        11, 4, -4, 4, 11, -4, 4, 4, -11,
        -11, -4, -4, -4, -11, -4, -4, -4, -11,
        11, -4, -4, 4, -11, -4, 4, -4, -11,
    ]
    let GRADIENTS_4D = [
        3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3,
        -3, 1, 1, 1, -1, 3, 1, 1, -1, 1, 3, 1, -1, 1, 1, 3,
        3, -1, 1, 1, 1, -3, 1, 1, 1, -1, 3, 1, 1, -1, 1, 3,
        -3, -1, 1, 1, -1, -3, 1, 1, -1, -1, 3, 1, -1, -1, 1, 3,
        3, 1, -1, 1, 1, 3, -1, 1, 1, 1, -3, 1, 1, 1, -1, 3,
        -3, 1, -1, 1, -1, 3, -1, 1, -1, 1, -3, 1, -1, 1, -1, 3,
        3, -1, -1, 1, 1, -3, -1, 1, 1, -1, -3, 1, 1, -1, -1, 3,
        -3, -1, -1, 1, -1, -3, -1, 1, -1, -1, -3, 1, -1, -1, -1, 3,
        3, 1, 1, -1, 1, 3, 1, -1, 1, 1, 3, -1, 1, 1, 1, -3,
        -3, 1, 1, -1, -1, 3, 1, -1, -1, 1, 3, -1, -1, 1, 1, -3,
        3, -1, 1, -1, 1, -3, 1, -1, 1, -1, 3, -1, 1, -1, 1, -3,
        -3, -1, 1, -1, -1, -3, 1, -1, -1, -1, 3, -1, -1, -1, 1, -3,
        3, 1, -1, -1, 1, 3, -1, -1, 1, 1, -3, -1, 1, 1, -1, -3,
        -3, 1, -1, -1, -1, 3, -1, -1, -1, 1, -3, -1, -1, 1, -1, -3,
        3, -1, -1, -1, 1, -3, -1, -1, 1, -1, -3, -1, 1, -1, -1, -3,
        -3, -1, -1, -1, -1, -3, -1, -1, -1, -1, -3, -1, -1, -1, -1, -3,
    ]
    function floor(x: number): number {
        return Math.floor(x)
    }
    function _extrapolate2d(perm: number[], xsb: number, ysb: number, dx: number, dy: number): number {

        let index = perm[(perm[xsb & 0xFF] + ysb) & 0xFF] & 0x0E

        let g = GRADIENTS_2D.slice(index, index + 2)
        let g1 = g[0]
        let g2 = g[1]
        return g1 * dx + g2 * dy
    }
    function _extrapolate3d(perm: number[], _perm_grad_index_3D: number[], xsb: number, ysb: number, zsb: number, dx: number, dy: number, dz: number): number {

        let index = _perm_grad_index_3D[
            (perm[(perm[xsb & 0xFF] + ysb) & 0xFF] + zsb) & 0xFF
        ]


        let g = GRADIENTS_3D.slice(index, index + 3)
        let g1 = g[0]
        let g2 = g[1]
        let g3 = g[2]
        return g1 * dx + g2 * dy + g3 * dz
    }

    function _extrapolate4d(perm: number[], xsb: number, ysb: number, zsb: number, wsb: number, dx: number, dy: number, dz: number, dw: number): number {

        let index = perm[(
            perm[(
                perm[(perm[xsb & 0xFF] + ysb) & 0xFF] + zsb
            ) & 0xFF] + wsb
        ) & 0xFF] & 0xFC


        let g = GRADIENTS_4D.slice(index, index + 4)
        let g1 = g[0]
        let g2 = g[1]
        let g3 = g[2]
        let g4 = g[3]
        return g1 * dx + g2 * dy + g3 * dz + g4 * dw

    }
    let seed_ = 0
    //% block="set seed $seed"
    export function seed(seed: number): void {
        seed_ = seed
    }

    //% block="2d noise x=$x y=$y"
    export function noise2d(x: number, y: number): number {
        let seed = seed_
        let perm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let perm_grad_index_3D = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let source = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        for (let i of [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]) {
            seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
            let r = floor((seed + 31) % (i + 1))
            if (r < 0) {
                r += i + 1
            }
            perm[i] = source[r]
            perm_grad_index_3D[i] = floor((perm[i] % (GRADIENTS_3D.length / 3)) * 3)
            source[r] = source[i]
        }


        let dx_ext = 0
        let dy_ext = 0
        let xsv_ext = 0
        let ysv_ext = 0
        //// Place input coordinates onto grid.
        let stretch_offset = (x + y) * STRETCH_CONSTANT_2D
        let xs = x + stretch_offset
        let ys = y + stretch_offset

        //// Floor to get grid coordinates of rhombus (stretched square) super-cell origin.
        let xsb = floor(xs)
        let ysb = floor(ys)

        //// Skew out to get actual coordinates of rhombus origin.We'll need these later.
        let squish_offset = (xsb + ysb) * SQUISH_CONSTANT_2D
        let xb = xsb + squish_offset
        let yb = ysb + squish_offset

        //// Compute grid coordinates relative to rhombus origin.
        let xins = xs - xsb
        let yins = ys - ysb

        //// Sum those together to get a value that determines which region we're in.
        let in_sum = xins + yins

        //// Positions relative to origin point.
        let dx0 = x - xb
        let dy0 = y - yb

        let value = 0

        //// Contribution(1, 0)
        let dx1 = dx0 - 1 - SQUISH_CONSTANT_2D
        let dy1 = dy0 - 0 - SQUISH_CONSTANT_2D
        let attn1 = 2 - dx1 * dx1 - dy1 * dy1
        //extrapolate = self._extrapolate2d
        if (attn1 > 0) {
            attn1 *= attn1
            value += attn1 * attn1 * _extrapolate2d(perm, xsb + 1, ysb + 0, dx1, dy1)
        }
        //// Contribution(0, 1)
        let dx2 = dx0 - 0 - SQUISH_CONSTANT_2D
        let dy2 = dy0 - 1 - SQUISH_CONSTANT_2D
        let attn2 = 2 - dx2 * dx2 - dy2 * dy2
        if (attn2 > 0) {
            attn2 *= attn2
            value += attn2 * attn2 * _extrapolate2d(perm, xsb + 0, ysb + 1, dx2, dy2)
        }
        if (in_sum <= 1) { //// We're inside the triangle (2-Simplex) at (0,0)
            let zins = 1 - in_sum
            if (zins > xins || zins > yins) {// // (0, 0) is one of the closest two triangular vertices
                if (xins > yins) {
                    let xsv_ext = xsb + 1
                    let ysv_ext = ysb - 1
                    let dx_ext = dx0 - 1
                    let dy_ext = dy0 + 1
                } else {
                    let xsv_ext = xsb - 1
                    let ysv_ext = ysb + 1
                    let dx_ext = dx0 + 1
                    let dy_ext = dy0 - 1
                }
            } else {// // (1, 0) and (0, 1) are the closest two vertices.
                let xsv_ext = xsb + 1
                let ysv_ext = ysb + 1
                let dx_ext = dx0 - 1 - 2 * SQUISH_CONSTANT_2D
                let dy_ext = dy0 - 1 - 2 * SQUISH_CONSTANT_2D
            }
        } else { //// We're inside the triangle (2-Simplex) at (1,1)
            let zins = 2 - in_sum
            if (zins < xins || zins < yins) {// // (0, 0) is one of the closest two triangular vertices
                if (xins > yins) {
                    let xsv_ext = xsb + 2
                    let ysv_ext = ysb + 0
                    let dx_ext = dx0 - 2 - 2 * SQUISH_CONSTANT_2D
                    let dy_ext = dy0 + 0 - 2 * SQUISH_CONSTANT_2D
                } else {
                    let xsv_ext = xsb + 0
                    let ysv_ext = ysb + 2
                    let dx_ext = dx0 + 0 - 2 * SQUISH_CONSTANT_2D
                    let dy_ext = dy0 - 2 - 2 * SQUISH_CONSTANT_2D
                }
            } else {// // (1, 0) and (0, 1) are the closest two vertices.
                let dx_ext = dx0
                let dy_ext = dy0
                let xsv_ext = xsb
                let ysv_ext = ysb
            }
            xsb += 1
            ysb += 1
            dx0 = dx0 - 1 - 2 * SQUISH_CONSTANT_2D
            dy0 = dy0 - 1 - 2 * SQUISH_CONSTANT_2D
        }
        //// Contribution(0, 0) or (1, 1)
        let attn0 = 2 - dx0 * dx0 - dy0 * dy0
        if (attn0 > 0) {
            attn0 *= attn0
            value += attn0 * attn0 * _extrapolate2d(perm, xsb, ysb, dx0, dy0)
        }

        //// Extra Vertex
        let attn_ext = 2 - dx_ext * dx_ext - dy_ext * dy_ext
        if (attn_ext > 0) {
            attn_ext *= attn_ext
            value += attn_ext * attn_ext * _extrapolate2d(perm, xsv_ext, ysv_ext, dx_ext, dy_ext)
        }
        return value / NORM_CONSTANT_2D



    }
    // block="3d noise x=$x y=$y z=$z"
    //% block="not working yet"
    export function noise3d(x: number, y: number, z: number): number {
        let seed = seed_
        let perm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let perm_grad_index_3D = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let source = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
        for (let i of [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]) {
            seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
            let r = floor((seed + 31) % (i + 1))
            if (r < 0) {
                r += i + 1
            }
            perm[i] = source[r]
            perm_grad_index_3D[i] = floor((perm[i] % (GRADIENTS_3D.length / 3)) * 3)
            source[r] = source[i]
        }


/*
        // Place input coordinates on simplectic honeycomb.
        stretch_offset = (x + y + z) * STRETCH_CONSTANT_3D
        xs = x + stretch_offset
        ys = y + stretch_offset
        zs = z + stretch_offset

        // Floor to get simplectic honeycomb coordinates of rhombohedron (stretched cube) super-cell origin.
        xsb = floor(xs)
        ysb = floor(ys)
        zsb = floor(zs)

        // Skew out to get actual coordinates of rhombohedron origin.We'll need these later.
        squish_offset = (xsb + ysb + zsb) * SQUISH_CONSTANT_3D
        xb = xsb + squish_offset
        yb = ysb + squish_offset
        zb = zsb + squish_offset

        // Compute simplectic honeycomb coordinates relative to rhombohedral origin.
        xins = xs - xsb
        yins = ys - ysb
        zins = zs - zsb

        // Sum those together to get a value that determines which region we're in.
        in_sum = xins + yins + zins

        // Positions relative to origin point.
        dx0 = x - xb
        dy0 = y - yb
        dz0 = z - zb

        value = 0
        extrapolate = self._extrapolate3d
        if (in_sum <= 1) { // We're inside the tetrahedron (3-Simplex) at (0,0,0)

            // Determine which two of (0, 0, 1), (0, 1, 0), (1, 0, 0) are closest.
            a_point = 0x01
            a_score = xins
            b_point = 0x02
            b_score = yins
            if (a_score >= b_score && zins > b_score) {
                b_score = zins
                b_point = 0x04
            } else if (a_score < b_score && zins > a_score) {
                a_score = zins
                a_point = 0x04
            }
            // Now we determine the two lattice points not part of the tetrahedron that may contribute.
            // This depends on the closest two tetrahedral vertices, including(0, 0, 0)
            wins = 1 - in_sum
            if (wins > a_score || wins > b_score) { // (0, 0, 0) is one of the closest two tetrahedral vertices.
                if (b_score > a_score) {
                    c = b_point
                } else {
                    c = a_point
                } // Our other closest vertex is the closest out of a and b.

                if ((c & 0x01) == 0) {
                    xsv_ext0 = xsb - 1
                    xsv_ext1 = xsb
                    dx_ext0 = dx0 + 1
                    dx_ext1 = dx0
                } else {
                    xsv_ext0 = xsv_ext1 = xsb + 1
                    dx_ext0 = dx_ext1 = dx0 - 1
                }
                if ((c & 0x02) == 0) {
                    ysv_ext0 = ysv_ext1 = ysb
                    dy_ext0 = dy_ext1 = dy0
                    if ((c & 0x01) == 0) {
                        ysv_ext1 -= 1
                        dy_ext1 += 1
                    } else {
                        ysv_ext0 -= 1
                        dy_ext0 += 1
                    }
                } else {
                    ysv_ext0 = ysb + 1
                    ysv_ext1 = ysb + 1
                    dy_ext0 = dy0 - 1
                    dy_ext1 = dy0 - 1
                }
                if ((c & 0x04) == 0) {
                    zsv_ext0 = zsb
                    zsv_ext1 = zsb - 1
                    dz_ext0 = dz0
                    dz_ext1 = dz0 + 1
                } else {
                    zsv_ext0 = zsv_ext1 = zsb + 1
                    dz_ext0 = dz_ext1 = dz0 - 1
                }
            } else { // (0, 0, 0) is not one of the closest two tetrahedral vertices.
                c = (a_point | b_point) // Our two extra vertices are determined by the closest two.

                if ((c & 0x01) == 0) {
                    xsv_ext0 = xsb
                    xsv_ext1 = xsb - 1
                    dx_ext0 = dx0 - 2 * SQUISH_CONSTANT_3D
                    dx_ext1 = dx0 + 1 - SQUISH_CONSTANT_3D
                } else {
                    xsv_ext0 = xsv_ext1 = xsb + 1
                    dx_ext0 = dx0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dx_ext1 = dx0 - 1 - SQUISH_CONSTANT_3D
                }
                if ((c & 0x02) == 0) {
                    ysv_ext0 = ysb
                    ysv_ext1 = ysb - 1
                    dy_ext0 = dy0 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 + 1 - SQUISH_CONSTANT_3D
                } else {
                    ysv_ext0 = ysv_ext1 = ysb + 1
                    dy_ext0 = dy0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 1 - SQUISH_CONSTANT_3D
                }
                if ((c & 0x04) == 0) {
                    zsv_ext0 = zsb
                    zsv_ext1 = zsb - 1
                    dz_ext0 = dz0 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 + 1 - SQUISH_CONSTANT_3D
                } else {
                    zsv_ext0 = zsv_ext1 = zsb + 1
                    dz_ext0 = dz0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 1 - SQUISH_CONSTANT_3D
                }
            }
            // Contribution(0, 0, 0)
            attn0 = 2 - dx0 * dx0 - dy0 * dy0 - dz0 * dz0
            if (attn0 > 0) {
                attn0 *= attn0
                value += attn0 * attn0 * extrapolate(xsb + 0, ysb + 0, zsb + 0, dx0, dy0, dz0)
            }
            // Contribution(1, 0, 0)
            dx1 = dx0 - 1 - SQUISH_CONSTANT_3D
            dy1 = dy0 - 0 - SQUISH_CONSTANT_3D
            dz1 = dz0 - 0 - SQUISH_CONSTANT_3D
            attn1 = 2 - dx1 * dx1 - dy1 * dy1 - dz1 * dz1
            if (attn1 > 0) {
                attn1 *= attn1
                value += attn1 * attn1 * extrapolate(xsb + 1, ysb + 0, zsb + 0, dx1, dy1, dz1)
            }
            // Contribution(0, 1, 0)
            dx2 = dx0 - 0 - SQUISH_CONSTANT_3D
            dy2 = dy0 - 1 - SQUISH_CONSTANT_3D
            dz2 = dz1
            attn2 = 2 - dx2 * dx2 - dy2 * dy2 - dz2 * dz2
            if (attn2 > 0) {
                attn2 *= attn2
                value += attn2 * attn2 * extrapolate(xsb + 0, ysb + 1, zsb + 0, dx2, dy2, dz2)
            }
            // Contribution(0, 0, 1)
            dx3 = dx2
            dy3 = dy1
            dz3 = dz0 - 1 - SQUISH_CONSTANT_3D
            attn3 = 2 - dx3 * dx3 - dy3 * dy3 - dz3 * dz3
            if (attn3 > 0) {
                attn3 *= attn3
                value += attn3 * attn3 * extrapolate(xsb + 0, ysb + 0, zsb + 1, dx3, dy3, dz3)
            }
        }
        else if (in_sum >= 2) { // We're inside the tetrahedron (3-Simplex) at (1,1,1)

            // Determine which two tetrahedral vertices are the closest, out of (1, 1, 0), (1, 0, 1), (0, 1, 1) but not (1, 1, 1).
            a_point = 0x06
            a_score = xins
            b_point = 0x05
            b_score = yins
            if (a_score <= b_score && zins < b_score) {
                b_score = zins
                b_point = 0x03
            } else if (a_score > b_score && zins < a_score) {
                a_score = zins
                a_point = 0x03
            }
            // Now we determine the two lattice points not part of the tetrahedron that may contribute.
            // This depends on the closest two tetrahedral vertices, including(1, 1, 1)
            wins = 3 - in_sum
            if (wins < a_score || wins < b_score) { // (1, 1, 1) is one of the closest two tetrahedral vertices.
                if (b_score < a_score) {
                    c = b_point
                } else {
                    c = a_point
                }// Our other closest vertex is the closest out of a and b.

                if ((c & 0x01) != 0) {
                    xsv_ext0 = xsb + 2
                    xsv_ext1 = xsb + 1
                    dx_ext0 = dx0 - 2 - 3 * SQUISH_CONSTANT_3D
                    dx_ext1 = dx0 - 1 - 3 * SQUISH_CONSTANT_3D
                } else {
                    xsv_ext0 = xsv_ext1 = xsb
                    dx_ext0 = dx_ext1 = dx0 - 3 * SQUISH_CONSTANT_3D

                    if ((c & 0x02) != 0) {
                        ysv_ext0 = ysv_ext1 = ysb + 1
                        dy_ext0 = dy_ext1 = dy0 - 1 - 3 * SQUISH_CONSTANT_3D
                        if ((c & 0x01) != 0) {
                            ysv_ext1 += 1
                            dy_ext1 -= 1
                        } else {
                            ysv_ext0 += 1
                            dy_ext0 -= 1
                        }
                    } else {
                        ysv_ext0 = ysv_ext1 = ysb
                        dy_ext0 = dy_ext1 = dy0 - 3 * SQUISH_CONSTANT_3D
                    }
                    if ((c & 0x04) != 0) {
                        zsv_ext0 = zsb + 1
                        zsv_ext1 = zsb + 2
                        dz_ext0 = dz0 - 1 - 3 * SQUISH_CONSTANT_3D
                        dz_ext1 = dz0 - 2 - 3 * SQUISH_CONSTANT_3D
                    } else {
                        zsv_ext0 = zsv_ext1 = zsb
                        dz_ext0 = dz_ext1 = dz0 - 3 * SQUISH_CONSTANT_3D
                    }
                }else{ // (1, 1, 1) is not one of the closest two tetrahedral vertices.
                    c = (a_point & b_point) // Our two extra vertices are determined by the closest two.

                    if (c & 0x01) != 0:
                    xsv_ext0 = xsb + 1
                    xsv_ext1 = xsb + 2
                    dx_ext0 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dx_ext1 = dx0 - 2 - 2 * SQUISH_CONSTANT_3D
                else:
                    xsv_ext0 = xsv_ext1 = xsb
                    dx_ext0 = dx0 - SQUISH_CONSTANT_3D
                    dx_ext1 = dx0 - 2 * SQUISH_CONSTANT_3D

                    if (c & 0x02) != 0:
                    ysv_ext0 = ysb + 1
                    ysv_ext1 = ysb + 2
                    dy_ext0 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 - 2 * SQUISH_CONSTANT_3D
                else:
                    ysv_ext0 = ysv_ext1 = ysb
                    dy_ext0 = dy0 - SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 * SQUISH_CONSTANT_3D

                    if (c & 0x04) != 0:
                    zsv_ext0 = zsb + 1
                    zsv_ext1 = zsb + 2
                    dz_ext0 = dz0 - 1 - SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 - 2 * SQUISH_CONSTANT_3D
                else:
                    zsv_ext0 = zsv_ext1 = zsb
                    dz_ext0 = dz0 - SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 * SQUISH_CONSTANT_3D

                    // Contribution(1, 1, 0)
                    dx3 = dx0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dy3 = dy0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dz3 = dz0 - 0 - 2 * SQUISH_CONSTANT_3D
                    attn3 = 2 - dx3 * dx3 - dy3 * dy3 - dz3 * dz3
                    if attn3 > 0:
                        attn3 *= attn3
                    value += attn3 * attn3 * extrapolate(xsb + 1, ysb + 1, zsb + 0, dx3, dy3, dz3)

                    // Contribution(1, 0, 1)
                    dx2 = dx3
                    dy2 = dy0 - 0 - 2 * SQUISH_CONSTANT_3D
                    dz2 = dz0 - 1 - 2 * SQUISH_CONSTANT_3D
                    attn2 = 2 - dx2 * dx2 - dy2 * dy2 - dz2 * dz2
                    if attn2 > 0:
                        attn2 *= attn2
                    value += attn2 * attn2 * extrapolate(xsb + 1, ysb + 0, zsb + 1, dx2, dy2, dz2)

                    // Contribution(0, 1, 1)
                    dx1 = dx0 - 0 - 2 * SQUISH_CONSTANT_3D
                    dy1 = dy3
                    dz1 = dz2
                    attn1 = 2 - dx1 * dx1 - dy1 * dy1 - dz1 * dz1
                    if attn1 > 0:
                        attn1 *= attn1
                    value += attn1 * attn1 * extrapolate(xsb + 0, ysb + 1, zsb + 1, dx1, dy1, dz1)

                    // Contribution(1, 1, 1)
                    dx0 = dx0 - 1 - 3 * SQUISH_CONSTANT_3D
                    dy0 = dy0 - 1 - 3 * SQUISH_CONSTANT_3D
                    dz0 = dz0 - 1 - 3 * SQUISH_CONSTANT_3D
                    attn0 = 2 - dx0 * dx0 - dy0 * dy0 - dz0 * dz0
                    if attn0 > 0:
                        attn0 *= attn0
                    value += attn0 * attn0 * extrapolate(xsb + 1, ysb + 1, zsb + 1, dx0, dy0, dz0)
        else: // We're inside the octahedron (Rectified 3-Simplex) in between.
                    // Decide between point (0, 0, 1) and (1, 1, 0) as closest
                    p1 = xins + yins
                    if p1 > 1:
                        a_score = p1 - 1
                    a_point = 0x03
                    a_is_further_side = True
            else:
                    a_score = 1 - p1
                    a_point = 0x04
                    a_is_further_side = False

                    // Decide between point (0, 1, 0) and (1, 0, 1) as closest
                    p2 = xins + zins
                    if p2 > 1:
                        b_score = p2 - 1
                    b_point = 0x05
                    b_is_further_side = True
            else:
                    b_score = 1 - p2
                    b_point = 0x02
                    b_is_further_side = False

                    // The closest out of the two (1, 0, 0) and (0, 1, 1) will replace the furthest out of the two decided above, if closer.
                    p3 = yins + zins
                    if p3 > 1:
                        score = p3 - 1
                    if a_score <= b_score and a_score < score:
                    a_point = 0x06
                    a_is_further_side = True
                    elif a_score > b_score and b_score < score:
                    b_point = 0x06
                    b_is_further_side = True
            else:
                    score = 1 - p3
                    if a_score <= b_score and a_score < score:
                    a_point = 0x01
                    a_is_further_side = False
                    elif a_score > b_score and b_score < score:
                    b_point = 0x01
                    b_is_further_side = False

                    // Where each of the two closest points are determines how the extra two vertices are calculated.
                    if a_is_further_side == b_is_further_side:
                        if a_is_further_side: // Both closest points on (1, 1, 1) side

                            // One of the two extra points is (1, 1, 1)
                            dx_ext0 = dx0 - 1 - 3 * SQUISH_CONSTANT_3D
                    dy_ext0 = dy0 - 1 - 3 * SQUISH_CONSTANT_3D
                    dz_ext0 = dz0 - 1 - 3 * SQUISH_CONSTANT_3D
                    xsv_ext0 = xsb + 1
                    ysv_ext0 = ysb + 1
                    zsv_ext0 = zsb + 1

                    // Other extra point is based on the shared axis.
                    c = (a_point & b_point)
                    if (c & 0x01) != 0:
                    dx_ext1 = dx0 - 2 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 * SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb + 2
                    ysv_ext1 = ysb
                    zsv_ext1 = zsb
                    elif(c & 0x02) != 0:
                    dx_ext1 = dx0 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 * SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb
                    ysv_ext1 = ysb + 2
                    zsv_ext1 = zsb
                    else:
                    dx_ext1 = dx0 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 - 2 * SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb
                    ysv_ext1 = ysb
                    zsv_ext1 = zsb + 2
                else:// Both closest points on (0, 0, 0) side

                    // One of the two extra points is (0, 0, 0)
                    dx_ext0 = dx0
                    dy_ext0 = dy0
                    dz_ext0 = dz0
                    xsv_ext0 = xsb
                    ysv_ext0 = ysb
                    zsv_ext0 = zsb

                    // Other extra point is based on the omitted axis.
                    c = (a_point | b_point)
                    if (c & 0x01) == 0:
                    dx_ext1 = dx0 + 1 - SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 1 - SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb - 1
                    ysv_ext1 = ysb + 1
                    zsv_ext1 = zsb + 1
                    elif(c & 0x02) == 0:
                    dx_ext1 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 + 1 - SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 1 - SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb + 1
                    ysv_ext1 = ysb - 1
                    zsv_ext1 = zsb + 1
                    else:
                    dx_ext1 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 + 1 - SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb + 1
                    ysv_ext1 = ysb + 1
                    zsv_ext1 = zsb - 1
            else: // One point on (0, 0, 0) side, one point on (1, 1, 1) side
                    if a_is_further_side:
                        c1 = a_point
                    c2 = b_point
                else:
                    c1 = b_point
                    c2 = a_point

                    // One contribution is a _permutation of (1, 1, -1)
                    if (c1 & 0x01) == 0:
                    dx_ext0 = dx0 + 1 - SQUISH_CONSTANT_3D
                    dy_ext0 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dz_ext0 = dz0 - 1 - SQUISH_CONSTANT_3D
                    xsv_ext0 = xsb - 1
                    ysv_ext0 = ysb + 1
                    zsv_ext0 = zsb + 1
                    elif(c1 & 0x02) == 0:
                    dx_ext0 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dy_ext0 = dy0 + 1 - SQUISH_CONSTANT_3D
                    dz_ext0 = dz0 - 1 - SQUISH_CONSTANT_3D
                    xsv_ext0 = xsb + 1
                    ysv_ext0 = ysb - 1
                    zsv_ext0 = zsb + 1
                else:
                    dx_ext0 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dy_ext0 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dz_ext0 = dz0 + 1 - SQUISH_CONSTANT_3D
                    xsv_ext0 = xsb + 1
                    ysv_ext0 = ysb + 1
                    zsv_ext0 = zsb - 1

                    // One contribution is a _permutation of (0, 0, 2)
                    dx_ext1 = dx0 - 2 * SQUISH_CONSTANT_3D
                    dy_ext1 = dy0 - 2 * SQUISH_CONSTANT_3D
                    dz_ext1 = dz0 - 2 * SQUISH_CONSTANT_3D
                    xsv_ext1 = xsb
                    ysv_ext1 = ysb
                    zsv_ext1 = zsb
                    if (c2 & 0x01) != 0:
                    dx_ext1 -= 2
                    xsv_ext1 += 2
                    elif(c2 & 0x02) != 0:
                    dy_ext1 -= 2
                    ysv_ext1 += 2
                else:
                    dz_ext1 -= 2
                    zsv_ext1 += 2

                    // Contribution(1, 0, 0)
                    dx1 = dx0 - 1 - SQUISH_CONSTANT_3D
                    dy1 = dy0 - 0 - SQUISH_CONSTANT_3D
                    dz1 = dz0 - 0 - SQUISH_CONSTANT_3D
                    attn1 = 2 - dx1 * dx1 - dy1 * dy1 - dz1 * dz1
                    if attn1 > 0:
                        attn1 *= attn1
                    value += attn1 * attn1 * extrapolate(xsb + 1, ysb + 0, zsb + 0, dx1, dy1, dz1)

                    // Contribution(0, 1, 0)
                    dx2 = dx0 - 0 - SQUISH_CONSTANT_3D
                    dy2 = dy0 - 1 - SQUISH_CONSTANT_3D
                    dz2 = dz1
                    attn2 = 2 - dx2 * dx2 - dy2 * dy2 - dz2 * dz2
                    if attn2 > 0:
                        attn2 *= attn2
                    value += attn2 * attn2 * extrapolate(xsb + 0, ysb + 1, zsb + 0, dx2, dy2, dz2)

                    // Contribution(0, 0, 1)
                    dx3 = dx2
                    dy3 = dy1
                    dz3 = dz0 - 1 - SQUISH_CONSTANT_3D
                    attn3 = 2 - dx3 * dx3 - dy3 * dy3 - dz3 * dz3
                    if attn3 > 0:
                        attn3 *= attn3
                    value += attn3 * attn3 * extrapolate(xsb + 0, ysb + 0, zsb + 1, dx3, dy3, dz3)

                    // Contribution(1, 1, 0)
                    dx4 = dx0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dy4 = dy0 - 1 - 2 * SQUISH_CONSTANT_3D
                    dz4 = dz0 - 0 - 2 * SQUISH_CONSTANT_3D
                    attn4 = 2 - dx4 * dx4 - dy4 * dy4 - dz4 * dz4
                    if attn4 > 0:
                        attn4 *= attn4
                    value += attn4 * attn4 * extrapolate(xsb + 1, ysb + 1, zsb + 0, dx4, dy4, dz4)

                    // Contribution(1, 0, 1)
                    dx5 = dx4
                    dy5 = dy0 - 0 - 2 * SQUISH_CONSTANT_3D
                    dz5 = dz0 - 1 - 2 * SQUISH_CONSTANT_3D
                    attn5 = 2 - dx5 * dx5 - dy5 * dy5 - dz5 * dz5
                    if attn5 > 0:
                        attn5 *= attn5
                    value += attn5 * attn5 * extrapolate(xsb + 1, ysb + 0, zsb + 1, dx5, dy5, dz5)

                    // Contribution(0, 1, 1)
                    dx6 = dx0 - 0 - 2 * SQUISH_CONSTANT_3D
                    dy6 = dy4
                    dz6 = dz5
                    attn6 = 2 - dx6 * dx6 - dy6 * dy6 - dz6 * dz6
                    if attn6 > 0:
                        attn6 *= attn6
                    value += attn6 * attn6 * extrapolate(xsb + 0, ysb + 1, zsb + 1, dx6, dy6, dz6)

                    // First extra vertex
                    attn_ext0 = 2 - dx_ext0 * dx_ext0 - dy_ext0 * dy_ext0 - dz_ext0 * dz_ext0
                    if attn_ext0 > 0:
                        attn_ext0 *= attn_ext0
                    value += attn_ext0 * attn_ext0 * extrapolate(xsv_ext0, ysv_ext0, zsv_ext0, dx_ext0, dy_ext0, dz_ext0)

                    // Second extra vertex
                    attn_ext1 = 2 - dx_ext1 * dx_ext1 - dy_ext1 * dy_ext1 - dz_ext1 * dz_ext1
                    if attn_ext1 > 0:
                        attn_ext1 *= attn_ext1
                    value += attn_ext1 * attn_ext1 * extrapolate(xsv_ext1, ysv_ext1, zsv_ext1, dx_ext1, dy_ext1, dz_ext1)

                    return value / NORM_CONSTANT_3D

*/
                    return 0
                }
                // block="4d noise x=$x y=$y z=$z w=$w"
                //% block="not working yet"
                export function noise4d(x: number, y: number, z: number, w: number): number {
                    let seed = seed_
                    let perm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    let perm_grad_index_3D = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    let source = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]
                    seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
                    seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
                    seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
                    for (let i of [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]) {
                        seed = overflow(seed * 6364136223846793005 + 1442695040888963407)
                        let r = floor((seed + 31) % (i + 1))
                        if (r < 0) {
                            r += i + 1
                        }
                        perm[i] = source[r]
                        perm_grad_index_3D[i] = floor((perm[i] % (GRADIENTS_3D.length / 3)) * 3)
                        source[r] = source[i]
                    }

                    return 0
                }
            }