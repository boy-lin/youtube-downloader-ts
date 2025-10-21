import { spawn } from 'child_process'

export async function muxWithFfmpeg(
  videoPath: string,
  audioPath: string,
  outPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const ff = spawn(
      'ffmpeg',
      ['-y', '-i', videoPath, '-i', audioPath, '-c', 'copy', outPath],
      { stdio: 'inherit' }
    )
    ff.on('error', reject)
    ff.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}`))
    })
  })
}
