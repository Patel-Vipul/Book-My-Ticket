import z from "zod"

const processBookingDto = z.object({
    seatId : z.uuid()
})

export {
    processBookingDto
}