import fs from "node:fs";

const GITHUB_OUTPUT_DELIMITER = "__GATE_QA_OUTPUT__";

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function writeGithubOutput(name, value) {
    const normalizedValue =
        value == null
            ? ""
            : typeof value === "string"
              ? value
              : JSON.stringify(value);

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(
            process.env.GITHUB_OUTPUT,
            `${name}<<${GITHUB_OUTPUT_DELIMITER}\n${normalizedValue}\n${GITHUB_OUTPUT_DELIMITER}\n`,
            "utf8"
        );
        return;
    }

    console.log(`::set-output name=${name}::${normalizedValue}`);
}

export function isRetryableStatus(status) {
    return status === 408 || status === 425 || status === 429 || status >= 500;
}

function buildHttpError(status, url) {
    const error = new Error(`HTTP ${status} for ${url}`);
    error.status = status;
    error.retryable = isRetryableStatus(status);
    return error;
}

export async function fetchTextWithRetry(
    url,
    {
        headers = {},
        timeoutMs = 30_000,
        retries = 3,
        backoffBaseMs = 10_000,
        logger = console,
        logPrefix = "",
    } = {}
) {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers,
                signal: AbortSignal.timeout(timeoutMs),
            });

            if (!response.ok) {
                throw buildHttpError(response.status, url);
            }

            return await response.text();
        } catch (error) {
            const retryable = error?.retryable !== false;
            if (!retryable || attempt === retries) {
                throw error;
            }

            const backoffMs = Math.pow(2, attempt) * backoffBaseMs;
            logger.warn(
                `${logPrefix}Fetch error on attempt ${attempt}/${retries}: ${error.message}. Retrying in ${backoffMs / 1000}s…`
            );
            await sleep(backoffMs);
        }
    }

    throw new Error(`Unreachable retry state for ${url}`);
}
