import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import apLogo from '../../../public/ap-logo.png'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()

  const payloadConfig = await config

  const payload = await getPayload({
    config: payloadConfig,
  })

  const { user } = await payload.auth({
    headers,
  })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">

        <Image
          alt="AlloyPress Logo"
          height={65}
          src={apLogo}
          width={80}
        />

        {!user && (
          <h1>
            Welcome to <span className="brand">AlloyPress</span>.
          </h1>
        )}

        {user && (
          <h1>
            Welcome back, <span className="brand">{user.email}</span>
          </h1>
        )}

        <div className="links">

          {/* PAYLOAD ADMIN */}

          
            <a className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
          >
            Go to admin panel
          </a>

          {/* DOCUMENTATION */}

           <a className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
            >
            Documentation
          </a>

        </div>
      </div>
    </div>
  )
}