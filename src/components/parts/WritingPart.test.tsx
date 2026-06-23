// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, test, expect, vi } from 'vitest'

afterEach(cleanup)
import { Part6Writing, Part7Writing } from './WritingPart'
import type { Part6Prompt, Part7Prompt } from '../../types'

const part6Prompt: Part6Prompt = {
  intro: 'Write an email to your friend Sam about a new club you have joined.',
  bullets: ['what the club is', 'why you joined it', 'when you go'],
  minWords: 25,
  sampleResponse: 'Hi Sam, I joined a football club last week. I love football!',
}

const part6PromptNoSample: Part6Prompt = {
  ...part6Prompt,
  sampleResponse: undefined,
}

const part7Prompt: Part7Prompt = {
  intro: 'Look at the three pictures. Write the story shown in the pictures.',
  storyArc: 'A boy rides a bike and meets a friend.',
  characters: [{ name: 'Tom', description: 'a boy of about 12' }],
  pics: [
    { label: 'Picture 1', text: 'bike / sunny', image: '/img/p1.webp' },
    { label: 'Picture 2', text: 'rain / bus stop', image: '/img/p2.webp' },
    { label: 'Picture 3', text: 'café / cakes', image: '/img/p3.webp' },
  ],
  minWords: 35,
  sampleResponse: 'Tom rode his bike on a sunny morning. Then it started to rain.',
}

const part7PromptNoSample: Part7Prompt = {
  ...part7Prompt,
  sampleResponse: undefined,
}

const noop = vi.fn()

describe('Part6Writing', () => {
  test('shows sample answer in review mode', () => {
    render(<Part6Writing prompt={part6Prompt} value="My answer." review={true} onChange={noop} />)
    expect(screen.getByText('Sample answer')).toBeInTheDocument()
    expect(screen.getByText('Hi Sam, I joined a football club last week. I love football!')).toBeInTheDocument()
  })

  test('hides sample answer when not in review mode', () => {
    render(<Part6Writing prompt={part6Prompt} value="My answer." review={false} onChange={noop} />)
    expect(screen.queryByText('Sample answer')).not.toBeInTheDocument()
  })

  test('hides sample answer when prompt has none', () => {
    render(<Part6Writing prompt={part6PromptNoSample} value="My answer." review={true} onChange={noop} />)
    expect(screen.queryByText('Sample answer')).not.toBeInTheDocument()
  })
})

describe('Part7Writing', () => {
  test('shows sample answer in review mode', () => {
    render(<Part7Writing prompt={part7Prompt} value="My story." review={true} onChange={noop} />)
    expect(screen.getByText('Sample answer')).toBeInTheDocument()
    expect(screen.getByText('Tom rode his bike on a sunny morning. Then it started to rain.')).toBeInTheDocument()
  })

  test('hides sample answer when not in review mode', () => {
    render(<Part7Writing prompt={part7Prompt} value="My story." review={false} onChange={noop} />)
    expect(screen.queryByText('Sample answer')).not.toBeInTheDocument()
  })

  test('hides sample answer when prompt has none', () => {
    render(<Part7Writing prompt={part7PromptNoSample} value="My story." review={true} onChange={noop} />)
    expect(screen.queryByText('Sample answer')).not.toBeInTheDocument()
  })
})
