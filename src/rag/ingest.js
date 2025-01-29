import 'dotenv/config'
import { Index } from '@upstash/vector'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import csv from 'csv-parser'
import ora from 'ora'

// Initialize Upstash Vector client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

export async function indexMovieData() {
  // Get the current file's path
  const __filename = fileURLToPath(import.meta.url)
  // Get the current directory's path (Folder name)
  const __dirname = dirname(__filename)

  const dataSetPath = join(__dirname, 'imdb_movie_dataset.csv')
  const outputPath = join(__dirname, 'imdb_movie_dataset.json')

  // Read the CSV file and store the results in an array
  const spinner = ora('Reading movie data...').start()
  const results = []
  fs.createReadStream(dataSetPath)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => console.log(`Data read into results`))

  console.log(results)
  spinner.text = 'Starting movie indexing...'

  for (const movie of results) {
    console.log(`Here 1`)
    spinner.text = `Indexing movie: ${movie.Title}`
    const text = `${movie.Title}. ${movie.Genre}. ${movie.Description}`
    console.log(`Here 2`)
    try {
      await index.upsert({
        id: movie.Title, // Using Rank as unique ID
        data: text, // Text will be automatically embedded
        metadata: {
          title: movie.Title,
          year: movie.Year,
          genre: movie.Genre,
          director: movie.Director,
          actors: movie.Actors,
          rating: movie.Rating,
          votes: movie.Votes,
          revenue: movie.Revenue,
          metascore: movie.Metascore,
        },
      })
    } catch (error) {
      spinner.fail(`Error indexing movie ${movie.Title}`)
      console.error(error)
    }
    console.log(`Here 3`)
  }
  spinner.succeed('Finished indexing movie data')
}

indexMovieData()
/* await index.query({
  data: 'Enter data as string',
  topK: 1,
  includeVectors: true,
  includeMetadata: true,
})
 */
