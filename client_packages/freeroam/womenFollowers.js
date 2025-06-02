// womenFollowers.js
exports.createFollowingWomen = (count) => {
    const player = mp.players.local;
    const basePos = player.position;
    const offsets = [
        { x: 2,  y: 0 },
        { x: 0,  y: 2 },
        { x: -2, y: 0 }
    ];

    for (let i = 0; i < count; i++) {
        const ofs = offsets[i % offsets.length];
        const spawnPos = new mp.Vector3(
            basePos.x + ofs.x,
            basePos.y + ofs.y,
            basePos.z
        );

        const npc = mp.peds.new(
            mp.game.joaat('mp_f_freemode_01'),
            spawnPos,
            player.getHeading(),
            player.dimension
        );

        setTimeout(() => {
            if (mp.peds.exists(npc)) {
                npc.setBlockingOfNonTemporaryEvents(false);

                const danceAnimation = "anim@amb@nightclub@dancers@crowddance_groups@";
                const danceName = "mi_dance_facedj_17_v1_male";
                mp.game.task.playAnim(npc.handle, danceAnimation, danceName, 8.0, -8.0, -1, 2, 0, false, false, false);

                setTimeout(() => {
                    if (mp.peds.exists(npc)) {
                        const newDanceName = "mi_dance_facedj_17_v1_female";
                        mp.game.task.playAnim(npc.handle, danceAnimation, newDanceName, 8.0, -8.0, -1, 2, 0, false, false, false);
                    }
                }, 5000);
            }
        }, 500);
    }
}