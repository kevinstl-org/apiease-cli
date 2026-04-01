SOURCE
https://docs.apiease.com/docs/overview/apiease

TITLE
APIEase

CONTENT
# APIEase

The API Integration And Automation Platform
===========================================

APIEase is a managed system where your API requests, workflows, and custom logic 
run, so you don’t have to build or maintain that infrastructure yourself.

**What It Does** - APIEase executes secure HTTP requests, triggers Shopify Flow 
actions, runs custom logic defined through Liquid Requests, and runs internal system functions through System Requests. [Learn more...](./what-it-does.md)

**How It Works** - Add fully configurable HTTP, Shopify Flow, Liquid, or System Requests 
to APIEase, and trigger them manually, from your storefront, through webhooks, 
on a cron schedule, from an external HTTP client, or via a Proxy Endpoint. [Learn more...](./how-it-works.md)

**Why You Need It** - Use APIEase to integrate and serve API calls with custom 
logic and automation without having to build, maintain, or host the backend. 
It securely supplies confidential credentials to any request, allowing them 
to be triggered from your storefront or from external systems without exposing 
those credentials publicly. [Learn more...](./why-you-need-it.md)

**Widgets** - Build reusable storefront widgets with Liquid and JavaScript, then render them using a theme app block. [Learn more...](../widgets/widgets-page.md)

SOURCE
https://docs.apiease.com/docs/overview/what-it-does

TITLE
What It Does

CONTENT
# What It Does

APIEase defines and runs four types of requests: [HTTP Requests](../requests/request-types/http-requests.md), [Flow Requests](../requests/request-types/flow-requests.md), [Liquid Requests](../requests/request-types/liquid-requests.md), and [System Requests](../requests/request-types/system-requests.md). Each request type is executed inside APIEase's managed environment, keeping credentials secure and ensuring logic is processed server-side.

APIEase also includes [Functions](../functions/functions-page.md) and [Widgets](../widgets/widgets-page.md). Functions are reusable Liquid helpers for Liquid Requests, while Widgets are designed for storefront UI instead of API execution.

## [HTTP Requests](../requests/request-types/http-requests.md)

HTTP Requests let you call external APIs using any method (GET, POST, PUT, PATCH, DELETE). You define the URL, headers, body, and parameters. APIEase executes the call on the server and returns the response to the system that triggered it.

## [Flow Requests](../requests/request-types/flow-requests.md)

Flow Requests allow Shopify Flow to trigger logic that APIEase runs. APIEase receives the Flow input, processes any parameters, executes the defined request or workflow, and returns output data that Flow can use in subsequent steps.

## [Liquid Requests](../requests/request-types/liquid-requests.md)

Liquid Requests run custom logic written in Liquid. They let you transform data, extract fields, perform simple conditionals, construct dynamic request bodies, and call reusable [Functions](../functions/using-functions-in-liquid-requests.md). The Liquid code executes within APIEase and can use inputs from any trigger source.

## [System Requests](../requests/request-types/system-requests.md)

System Requests run internal APIEase functions (they do not call an external URL). This is useful for app-managed actions such as setting, getting, or deleting persisted variables.

## [Widgets](../widgets/widgets-page.md)

Widgets are reusable storefront components that render Liquid templates with optional JavaScript. They are added to your theme through the APIEase app block and can be updated centrally in the APIEase admin.

## [Functions](../functions/functions-page.md)

Functions are reusable Liquid helpers that run inside a parent Liquid Request. Use them to keep shared formatting, transformation, and response-shaping logic in one place instead of repeating the same Liquid across multiple requests.

## [Secure Parameter Storage](./why-you-need-it.md#why-secure-parameter-handling-matters)

APIEase stores confidential values -- such as API keys, tokens, and passwords -- on the server and never exposes them to the storefront or external clients. When a request is triggered, APIEase injects these secure parameters into the request at runtime so they are used during execution but never returned or made visible outside the managed environment.

SOURCE
https://docs.apiease.com/docs/overview/how-it-works

TITLE
How It Works

CONTENT
# How It Works

APIEase runs the requests and logic you define. Each request ([HTTP](../requests/request-types/http-requests.md), [Flow](../requests/request-types/flow-requests.md), [Liquid](../requests/request-types/liquid-requests.md), or [System](../requests/request-types/system-requests.md)) is configured in the APIEase admin and executed inside the APIEase runtime, where confidential parameters remain secure.

This page describes how requests are configured, how they are triggered, and how these elements combine to create custom functionality.

APIEase also includes reusable [Functions](../functions/functions-page.md), persisted [Variables](../variables/variables-page.md), and storefront widgets. Widgets render Liquid and JavaScript through a theme app block and are managed in the same admin.

---

## Configuring Requests

When you create a request, you choose the type ([HTTP Request](../requests/request-types/http-requests.md), [Flow Request](../requests/request-types/flow-requests.md), [Liquid Request](../requests/request-types/liquid-requests.md), or [System Request](../requests/request-types/system-requests.md)) and define the parameters it needs. These parameters can include:
- values passed in at trigger time
- values extracted from earlier requests
- Liquid based transformations
- confidential parameters stored securely in APIEase (see [Why Secure Parameter Handling Matters](./why-you-need-it.md#why-secure-parameter-handling-matters))

Each request is saved as a reusable and callable unit of logic.

If you need reusable helper logic inside a Liquid Request, create a [Function](../functions/functions-page.md) and call it from Liquid instead of repeating the same template code.

For setup steps, see [How to Add Requests](../requests/how-to-add-requests.md).

If you need to manage persisted values outside of a request, use the [Variables page](../variables/variables-page.md).

---

## Configuring Widgets

Create widgets in the APIEase admin by defining a name, handle, and Liquid template. You can add optional inline or external JavaScript that loads when the widget renders. See [Widgets page](../widgets/widgets-page.md) and [Widget edit page](../widgets/widget-edit-page.md) for the full workflow.

## Displaying Widgets

Add the **APIEase App Block** block to your theme and set the widget handle. The block loads the widget content and scripts automatically. See [Storefront block extension](../widgets/storefront-block-extension.md).

---

## Triggering Requests

A configured request can be invoked through several available trigger types. Each trigger activates the same underlying request definition, allowing the logic to run without duplication. Triggers are available in the following order:

### [Webhooks](../requests/triggers/webhooks/trigger-requests-from-a-webhook.md)

Run a request automatically when Shopify or an external system sends a webhook to APIEase.

### [Cron Schedule](../requests/triggers/cron-schedule.md)

Use a built in cron schedule to run a request at recurring intervals.

### [Proxy Endpoint](../requests/triggers/proxy-endpoint.md)

Expose a request as a public API endpoint with an optional shared secret. External systems call the endpoint and APIEase runs the associated request.

### [Manual Calls](../requests/triggers/manual-calls.md)

Invoke any request directly from the APIEase admin for testing or on demand execution.

### [Storefont Calls](../requests/triggers/storefont-calls.md)

Trigger a request from your storefront using Shopify's app proxy. The storefront sends only non confidential data and APIEase performs the execution on the server side.

### [Remote Calls](../requests/triggers/calling-requests-remotely.md)

 Send an HTTP call from any external system to APIEase to initiate a request with authentication.

### [Chained Request](../requests/request-parameters/chained-requests.md)

Run a request from within another request. A request can call additional requests and pass outputs downstream, allowing multi step workflows.

---

## Combining Request Types and Triggers

Because each request is modular and can be triggered in any of these ways, users can create custom functionality by combining:
- the request type (HTTP, Flow, Liquid, or System)
- the trigger source
- any number of chained steps

This supports use cases ranging from simple API calls to multi step workflows that coordinate data across multiple systems, without building or hosting a backend.

SOURCE
https://docs.apiease.com/docs/overview/why-you-need-it

TITLE
Why You Need It

CONTENT
# Why You Need It

Connecting APIs, running custom logic, and coordinating workflows usually requires a backend. Most stores solve this by building and hosting a custom app, creating one off server functions, or chaining together several single purpose tools. Each project introduces new infrastructure to build, deploy, and maintain, and each client or use case often requires a separate implementation.

APIEase provides a central place for all API calls, logic, and automation to run. Instead of building a backend for each project, you define requests in APIEase and use them wherever they are needed: in the storefront, in Flow, from webhooks, on a schedule, or from external systems. This removes the need to manage separate servers, reduces infrastructure tasks for every new integration, and makes it possible to reuse the same request definitions across multiple workflows and use cases.

APIEase also handles the related operational concerns that a backend normally carries, such as concurrency control, safe parameter handling, execution tracking, and request chaining. As a result, you can create fully functional integrations that behave like a custom app without actually building and operating the app itself.

Widgets extend that same model to storefront UI. You can build reusable Liquid and JavaScript components in APIEase and place them in a theme through the app block, without maintaining a separate widget service or front-end app.

---

## Why Secure Parameter Handling Matters

API calls and external services often require confidential values such as API keys, tokens, or account credentials. These values cannot be placed in the storefront because anything delivered to a browser is visible through developer tools. Liquid code, JavaScript, and JSON embedded in a theme can all be inspected by anyone who loads the page.

If confidential parameters are exposed in the storefront, they can be used to access external systems, submit unauthorized requests, or retrieve private data. This creates a clear risk for the store, the merchant, and the systems being connected.

APIEase prevents this exposure by storing all confidential parameters securely on the server. When a request runs, APIEase injects sensitive values at execution time so they are never sent to the storefront or to any external caller. Even when a request is triggered from the storefront, the sensitive parts of the request remain inside the APIEase environment.

By keeping credentials server side at all times, APIEase ensures that API keys, tokens, and other sensitive values remain protected while still allowing the request to be triggered from any allowed source.

SOURCE
https://docs.apiease.com/docs/requests/requests-overview

TITLE
Requests Overview

CONTENT
# Requests Overview

Everything that you can accomplish with APIEase starts with a request.

A request is a configuration that defines how APIEase should securely call an external API, trigger a Shopify Flow workflow, run Liquid logic, or execute internal system functions. Each request contains the destination (when applicable), any necessary parameters, and optional logic to determine when and how it should run.

Requests can be used for a wide variety of purposes, including:

- Calling third-party APIs from your Shopify storefront
- Receiving webhook events and responding with external actions
- Scheduling recurring data syncs with external systems
- Triggering Shopify Flow automations
- Executing multiple requests in sequence based on API responses

There are four [Request types](./request-types/request-types-overview.md) in APIEase: [HTTP requests](./request-types/http-requests.md), [Flow requests](./request-types/flow-requests.md), [Liquid requests](./request-types/liquid-requests.md), and [System requests](./request-types/system-requests.md).

Every request you create can include embedded parameters, dynamic storefront values, or confidential credentials stored securely on the server.

Once created, each request can be triggered in several ways. You can run it manually from the admin, trigger it automatically using a webhook, start it from the storefront using Shopify's app proxy, or schedule it to run on a repeating interval using the built in cron system.

Requests are the core building blocks of APIEase. They give you a simple and secure way to create integrations, automate tasks, and connect your storefront with external services without the need to host your own app.

SOURCE
https://docs.apiease.com/docs/requests/how-to-add-requests

TITLE
How to Add Requests

CONTENT
# How to Add Requests

Follow these steps to create a request in APIEase.

1. Open **Requests** in Shopify Admin (APIEase Requests submenu on the lower left).
   ![APIEase Requests submenu](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/requests-sub-menu.png?v=1744752589)
2. Click the **Add Request** plus button in the upper-left corner.
   ![Add request button](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/add-http-api-requests.png?v=1744748372)
3. Configure the [HTTP](./request-types/http-requests.md) or [Flow](./request-types/flow-requests.md) request.
4. Click **Save**. The request is ready to run based on the triggers you selected.

SOURCE
https://docs.apiease.com/docs/requests/import-from-postman

TITLE
Import from Postman

CONTENT
# Import from Postman

Bring your existing Postman requests into APIEase so you do not have to recreate paths, headers, and bodies by hand.

## Export your Postman collection
1. In Postman, open the collection you want to move into APIEase.
2. Click the kebab menu (⋯) next to the collection name and choose **Export**.
3. Select **Collection v2.1 (recommended)** and save the JSON file (keep it under 1 MB so the upload limit is not exceeded).

## Upload the collection in APIEase
1. In the APIEase admin, go to **Requests**.
2. Click the **Import From Postman** icon button next to **Add Request**, and choose the exported JSON file.
3. APIEase will preview the collection and add each request to the table with the proper method, URL path, headers, query params, and body.
4. Review the imported rows, replace variable auth values (for example `{{POSTMAN_BEARER_TOKEN}}`), and click **Save** to persist them.

## How requests are mapped
- Postman variables such as `{{api_base}}` become APIEase variables (`{api_base}`) so you can wire them to [in-app parameters](./request-parameters/in-app-parameters/in-app-parameters-overview.md), [dynamic embedded parameters](./request-parameters/dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md), or payloads from [chained requests](./request-parameters/chained-requests.md) and [webhook triggers](./triggers/webhooks/mapping-webhook-parameters.md).
- Path segments like `:id` and Postman URL variables become path parameters.
- Bearer, Basic, and API key auth blocks become Authorization headers with variable values so secrets are not imported; update them after import with your real credentials or secrets.

SOURCE
https://docs.apiease.com/docs/requests/export-to-postman

TITLE
Export to Postman

CONTENT
# Export to Postman

Export your APIEase requests to Postman so teammates can collaborate outside Shopify or run calls locally.

## Download your collection
1. In the APIEase admin, go to **Requests**.
2. Click the **Export To Postman** icon button (hover to see the "Export To Postman" tooltip) to the right of the request actions.
3. APIEase will download `<shop>-requests.postman_collection.json` to your browser’s downloads folder; import that file into Postman.

## What the export includes
- Only active HTTP requests are included; they stay organized using the same folder paths you set in APIEase.
- URLs include your configured host, path, and query string with APIEase variables converted to Postman variables.
- Request bodies are exported as raw payloads with Postman variables (`{{variable}}`) where APIEase variables existed.
- Authorization headers become Postman auth blocks with variable tokens so secrets are not exposed.

## Tips for using the collection
- Create a Postman environment to fill in hostnames, tokens, and any variables before sending requests.
- Replace the variable auth tokens (for example `{{POSTMAN_BEARER_TOKEN}}`) with valid credentials in your environment.
- Re-export the collection after you add or edit requests in APIEase to keep Postman in sync.

SOURCE
https://docs.apiease.com/docs/requests/request-types/request-types-overview

TITLE
Request types overview

CONTENT
# Request types overview

APIEase supports four request types. Pick the one that fits how you want to call external services, Shopify Flow, or internal system functions.

- **[HTTP requests](./http-requests.md)**: Standard API calls to external services. You define the endpoint, method, headers, and body content.
- **[Flow requests](./flow-requests.md)**: Start or continue a Shopify Flow automation, optionally including data pulled from other API calls or the storefront.
- **[Liquid requests](./liquid-requests.md)**: Run a Liquid template that can call other APIEase requests and shape the output—helpful for logic or combining multiple requests without a custom app.
- **[System requests](./system-requests.md)**: Run internal APIEase functions (for example, set/get/delete persisted variables) without calling an external URL.

Use HTTP requests when you need a direct API call, Flow requests when the action should occur inside Shopify Flow, Liquid requests when you need templating or conditional logic without a custom app, and System requests for internal app-managed actions.

SOURCE
https://docs.apiease.com/docs/requests/request-types/http-requests

TITLE
HTTP Requests

CONTENT
# HTTP Requests

HTTP API requests are highly configurable with many options.  HTTP requests allow you to securely call any external API directly from your Shopify store or through other trigger methods such as webhooks, storefront app proxy, or a recurring schedule.

![HTTP request editor](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/add-http-api-requests.png?v=1744748372)

**HTTP Request Fields**

- **Name**: Optional display name. Required if this request is called by name from a [chained request](../request-parameters/chained-requests.md).
- **Type**: Set to `http` for a standard API call to an external service.
- **Address**: Full endpoint of the external API (for example, `https://api.example.com/data`).
- **Method**: Choose GET, POST, DELETE, PUT, PATCH, or OPTIONS.
- **Parameters ([?](../request-parameters/in-app-vs-dynamic.md))**:
  - **Headers**: Add required headers (Authorization, Content-Type, etc.).
  - **Query parameters**: Values to include in the query string.
  - **Body**: For POST/PUT style calls; accept raw JSON or form fields.
  - **Path**: Dynamic [path variables](../request-parameters/path-variables.md) to substitute into the address.
  - **System**: Used by APIEase for features such as [Customer Authentication](../customer-authenticated-requests.md).
  - You can provide [in app parameters](../request-parameters/in-app-vs-dynamic.md) or pass [dynamic embedded parameters](../request-parameters/dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) from the storefront.
  - If the request includes credentials or API keys, mark them as **Sensitive** so they remain encrypted and never shown in the storefront or admin UI.
  


- **Triggers ([?](../triggers/webhooks/trigger-requests-from-a-webhook.md))**: Choose how the request should be triggered:
  - Automatically via [webhook](../triggers/webhooks/trigger-requests-from-a-webhook.md)
  - On a recurring schedule using [cron](../triggers/cron-schedule.md)
  - As an endpoint served by APIEase via [Proxy Endpoints](../triggers/proxy-endpoint.md)
  - [Remote Calls](../triggers/calling-requests-remotely.md) from outside Shopify.
  - Manually via the "Copy and Execute" link on the requests admin page
  - From your storefront using Shopify's app proxy

- **Next Request**: You can implement [chained requests](../request-parameters/chained-requests.md) by setting the Next Request field to the name of a request to run after this one completes.

SOURCE
https://docs.apiease.com/docs/requests/request-types/flow-requests

TITLE
Flow Requests

CONTENT
# Flow Requests

Flow requests allow you to securely trigger or continue a Shopify Flow workflow. You can pass data into the Flow from your storefront, a webhook, or another request, enabling flexible and secure automation without exposing any sensitive information.

![Flow request editor](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/add-http-api-requests.png?v=1744748372)

**Flow Request Fields**

- **Name**: Optional display name. Needed when another request calls this one via a [chained request](../request-parameters/chained-requests.md).
- **Type**: Set to `flow` to trigger a Shopify Flow workflow.
- **Parameters ([?](../request-parameters/in-app-vs-dynamic.md))**:
  - **Flow**: JSON key/value pairs passed to your workflow.
  - **System**: Used by APIEase in cases such as [Customer Authentication](../customer-authenticated-requests.md).
  - Supply [in app parameters](../request-parameters/in-app-vs-dynamic.md) or [dynamic embedded parameters](../request-parameters/dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) from the storefront.
  - Mark credentials or secrets as **Sensitive** so they are encrypted and never exposed in the storefront or admin UI.

**Triggers ([?](../triggers/webhooks/trigger-requests-from-a-webhook.md))**: Choose how the request should be triggered:

- Automatically via [webhook](../triggers/webhooks/trigger-requests-from-a-webhook.md)
- On a recurring schedule using [cron](../triggers/cron-schedule.md)
- As an endpoint served by APIEase via [Proxy Endpoints](../triggers/proxy-endpoint.md)
- [Remote Calls](../triggers/calling-requests-remotely.md) from outside Shopify.
- Manually via the "Copy and Execute" link on the requests admin page
- From your storefront using Shopify's app proxy

**Next Request**: You can specify the name of another request to run after this request finishes. This allows you to build multi-step workflows using [chained requests](../request-parameters/chained-requests.md).

SOURCE
https://docs.apiease.com/docs/requests/request-types/liquid-requests

TITLE
Liquid Requests

CONTENT
# Liquid Requests

Liquid requests let you run a Liquid template that can call any APIEase request and shape the output. This is useful when you want logic, variable substitution, or to combine multiple requests into one response without building a custom app.

**Liquid Request Fields**

**Name**: You can optionally give your request a name for your reference. If you plan to call this request from another request using a chained request, the name will be used by the calling request.

**Type**: Set this to **liquid** to create a request that renders a Liquid template.

**Liquid**: The Liquid code that will run when this request is triggered. Your template can:

- Use standard Liquid tags like assign, if, elsif, else, for, and capture.
- Call other APIEase requests using the custom call tag shown below.
- Call saved APIEase Functions using the custom function tag shown below.
- Read parameters passed in from the storefront or other triggers.

**Parameters**: You can provide in app parameters directly in the request configuration. If you need values that depend on customer activity or storefront context, you can pass dynamic embedded parameters from the storefront.

- **Liquid**: Key value pairs you want available to the template as variables.
- **System**: System parameters used by APIEase in special cases such as Customer Authentication.

**How Liquid parameters replace variables in Liquid requests**

Liquid parameters define variables for the Liquid template. Reference a Liquid parameter in request values using `{parameterName}` and APIEase replaces it at runtime.

Example:

- Liquid parameter name: `segment`
- Liquid parameter value: `vip`

```liquid
{% call {
  "requestId": "segment-offers",
  "queryParamsEmbedded": {
    "segment": "{segment}"
  }
} as response %}
{{ response.status }}
```

In this example, `{segment}` is replaced by the Liquid parameter value before the request is executed.

If your request includes confidential values such as API keys or credentials, check the Sensitive checkbox. These values are stored on the server and are never exposed to the storefront or even the admin screen. Once they have been submitted they are encrypted in our database and only decrypted for use at runtime.

**Supported Embedded Parameters**

When you invoke a request from a Liquid template using the call tag, you can include embedded parameters that override or add to the saved request configuration at runtime.

- `headersEmbedded`: Object of header key/value pairs to merge with saved request headers.
- `queryParamsEmbedded`: Object of query key/value pairs to merge with saved request query parameters.
- `pathParamsEmbedded`: Object of path key/value pairs to substitute into the saved request address path.
- `bodyEmbedded`: Object or raw string to use as the saved request body.
- `flowParamsEmbedded`: Object of key/value pairs passed into a Flow request.
- `liquidParamsEmbedded`: Object of key/value pairs made available to another Liquid request.
- `systemParamsEmbedded`: Object of key/value pairs used by APIEase for special features such as Customer Authentication.

At runtime, embedded parameters take precedence over in app parameters for the matching scope.

**The call tag**

Use the call tag to invoke any saved APIEase request from within your Liquid template. You can bind the response to a variable with `as`. You must provide `requestId` to the call tag.

Basic syntax with hard coded requestId:

```liquid
{% call { "requestId": "51bcee90-89ce-11f0-ac46-894599c37" } as response %}
{{ response.status }}
{{ response.data | json }}
```

Basic syntax with requestId that must be set as a Liquid Parameter:

```liquid
{% call { "requestId": "{requestId}" } as response %}
{{ response.status }}
{{ response.data | json }}
```

JSON style syntax:

You can also pass a single JSON object. This is convenient when you want to embed multiple parameter groups.

```liquid
{% call {
  "requestId": "",
  "headersEmbedded": { "Authorization": "Bearer {api_token}" },
  "queryParamsEmbedded": { "limit": 10 },
  "pathParamsEmbedded": { "productId": "product_id" },
  "bodyEmbedded": { "note": "from Liquid" }
} as response %}
  {{ response.status }}
```

Response fields:

- `response.status`: The numeric status returned by the request.
- `response.data`: The response payload. Use the json filter to print full objects.

**The function tag**

Use the function tag to call a saved [Function](../../functions/functions-page.md) from inside a Liquid Request. Functions are reusable Liquid helpers that run inside the current Liquid Request and do not create a separate request execution.

Inline syntax:

```liquid
{% function build_summary(customer.firstName, customer.lastName) as summary %}
{{ summary.message }}
```

Object syntax:

```liquid
{% function {
  "functionName": "build_summary",
  "args": {
    "firstName": "{{ customer.firstName }}",
    "lastName": "{{ customer.lastName }}"
  }
} as summary %}
{{ summary.message }}
```

Important behavior:

- `as <name>` is required.
- Inline arguments are mapped to the Function's declared parameters in order.
- Object syntax supports `functionName` or `functionId`.
- Missing arguments resolve to `null`.
- Extra positional arguments are rejected.

For full details and more examples, see [Using Functions in Liquid Requests](../../functions/using-functions-in-liquid-requests.md).

**Using values from a previous response**

You can save values from one call and pass them into a second call using embedded parameters.

```liquid
{% call {"requestId": "51bcee90-89ce-11f0-ac46-894599c37"} as getCustomer %}

{% assign email = getCustomer.data.email %}

{% call {
  "requestId": "51bcee90-89ce-11f0-ac46-894599c38",
  "bodyEmbedded": { "email": email }
} as sendEmail %}

{{ sendEmail.status }}
```

**Control flow examples**

Conditional logic:

```liquid
{% call { "requestId": "51bcee90-89ce-11f0-ac46-894599c37" } as response %}
{% if response.status == 200 %}
  Success
{% else %}
  Error
{% endif %}
```

Looping:

```liquid
{% call { "requestId": "51bcee90-89ce-11f0-ac46-894599c37" } as response %}

{% for item in response.data.items %}
  {{ forloop.index }}. {{ item.title }}
{% endfor %}
```

Assign and capture:

```liquid
{% call { "requestId": "51bcee90-89ce-11f0-ac46-894599c37" } as response %}

{% if response.status == 200 %}
  Success
{% else %}
  Error
{% endif %}
```

**Rendering tips**

- To print a full JSON object, use `| json`.
- When you only need a specific field, access it directly (for example, `{{ response.data.id }}`).
- Use `assign` to store values you will reuse across calls.

**Triggers**

Choose how the request should be triggered:
  - Automatically via [webhook](../triggers/webhooks/trigger-requests-from-a-webhook.md)
  - On a recurring schedule using [cron](../triggers/cron-schedule.md)
  - As an endpoint served by APIEase via [Proxy Endpoints](../triggers/proxy-endpoint.md)
  - [Remote Calls](../triggers/calling-requests-remotely.md) from outside Shopify.
  - Manually via the "Copy and Execute" link on the requests admin page
  - From your storefront using Shopify's app proxy

**Next Request**

You can specify the name of another request to run after this request finishes. This allows you to build multi step workflows using chained requests.

**Examples**

Hello world:

```liquid
{% assign greeting = "Hello from Liquid" %}
{{ greeting }}
```

Call a saved HTTP request and show JSON:

```liquid
{% call { "requestId": "51bcee90-89ce-11f0-ac46-894599c37" } as r %}
{{ r.data | json }}
```

Call a Flow request with values from the template:

```liquid
{% assign orderId = params.order_id %}
{% call {
  "requestId": "start-order-flow",
  "flowParamsEmbedded": { "orderId": "{{orderId}}" }
} as flowRun %}
Run started: {{ flowRun.status }}
```

POST with a dynamic body:

```liquid
{% assign email = "test@example.com" %}
{% call {
  "requestId": "51bcee90-89ce-11f0-ac46-894599c37",
  "headersEmbedded": { "Content-Type": "application/json" },
  "bodyEmbedded": { "email": "{{email}}", "source": "storefront" }
} as sub %}
{{ sub.status }}
```

SOURCE
https://docs.apiease.com/docs/requests/request-types/system-requests

TITLE
System Requests

CONTENT
# System Requests

System requests run internal APIEase functions. Unlike HTTP requests, System requests do not call an external URL.

If you want to manage the same persisted values manually in the admin, see the [Variables page](../../variables/variables-page.md).

## When to use System requests

Use a System request when you need an internal, app-managed action (for example, managing shop variables) instead of calling an external service.

## How to define a System request

**System Request Fields**

- **Name**: Optional display name. Required if this request is called by name from a [chained request](../request-parameters/chained-requests.md).
- **Type**: Set to `system`.
- **Address**: Unused for System requests (leave blank).
- **Parameters ([?](../request-parameters/in-app-vs-dynamic.md))**:
  - **System**: Provide the system parameters listed below.

System request behavior is controlled by two in-app system parameters:

- `function`: One of `setVariables`, `getVariables`, or `deleteVariables`
- `arguments`: Either:
  - a JSON string representing the arguments array (recommended for persisted request definitions), or
  - an actual array at runtime (for example via `httpParameters.system.arguments`)

`arguments` must be an array (or a JSON string that parses to an array) of objects. Each array entry must include:

- `name` (string, required)

## Supported functions

### setVariables

Each `arguments` entry supports:

- `name` (required)
- `value` (required to set a meaningful value; may be `null` if intentionally setting `null`)
- `sensitive` (optional boolean; APIEase may accept `"true"` / `"false"` but prefer a boolean)

Response `data` shape:

```json
{
  "<name>": { "set": true }
}
```

Example system parameters:

- `function`: `setVariables`
- `arguments` (JSON string):

```json
[
  { "name": "variable1", "value": "value1", "sensitive": true },
  { "name": "variable2", "value": "value2" }
]
```

Example response (`data`):

```json
{ "variable1": { "set": true }, "variable2": { "set": true } }
```

### getVariables

Each `arguments` entry supports:

- `name` (required)
- `defaultValue` (optional; used when the variable is missing or null/undefined)

Response `data` shape:

```json
{
  "<name>": "<value-or-default-or-null>"
}
```

Example `arguments` (JSON string):

```json
[
  { "name": "variable1" },
  { "name": "variable2", "defaultValue": "fallback2" }
]
```

Example response (`data`):

```json
{ "variable1": "persistedValue1", "variable2": "fallback2" }
```

### deleteVariables

Each `arguments` entry supports:

- `name` (required)

Response `data` shape:

```json
{
  "<name>": { "deleted": true }
}
```

Example `arguments` (JSON string):

```json
[
  { "name": "variable1" },
  { "name": "variable2" }
]
```

Example response (`data`):

```json
{ "variable1": { "deleted": true }, "variable2": { "deleted": false } }
```

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/request-parameters-overview

TITLE
Request Parameters Overview

CONTENT
# Request Parameters Overview

APIEase lets you pass data into requests in several ways so each run has the inputs it needs without exposing sensitive values.

- **In-app parameters**: Static or confidential values stored securely in APIEase. Use these when the value rarely changes or must stay server-side.
- **Dynamic embedded parameters**: Values provided at runtime from the storefront, webhooks, or other triggers (headers, query, path, body, flow). Use these for request-specific data like customer ids or product handles.
- **Path variables**: Placeholders in the request URL (`/products/{id}`) that are filled by in-app or dynamic embedded parameters when the request executes.
- **Chained request parameters**: Data passed from the response of one request into the next request in a sequence.

Choose the parameter type based on where the value comes from and whether it must stay confidential. Combine these options to keep sensitive data secure while still letting each trigger supply the context it needs.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-vs-dynamic

TITLE
In-app parameters vs dynamic embedded parameters

CONTENT
# In-app parameters vs dynamic embedded parameters

Parameters that do not change, static parameters, should be set in the app. A classic example of this would be setting the header parameter "Content-Type" to "application/json".

Parameters that might change per call have to be set as dynamic embedded parameters. An example of this would be a request about a particular product that the customer is viewing in the storefront. In this case you would set product id as an embedded parameter directly in the storefront page that needs to request information about a particular product.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-parameters-overview

TITLE
In-app parameters overview

CONTENT
# In-app parameters overview

In-app parameters are values you configure in the APIEase admin to be injected into outgoing requests. They live on the server, so secrets and default values stay hidden from storefront visitors while still being applied every time a request runs.

**Why use in-app parameters**
- Keep secrets safe: tokens, API keys, and internal headers stay server-side.
- Ensure consistency: apply the same defaults (such as content type or store identifier) across every request.
- Reduce duplication: define values once instead of repeating them in multiple requests or client code.

**Parameter types**
- [Headers](./in-app-header-parameters.md) for auth and custom metadata.
- [Body](./in-app-body-parameters.md) for payload fields you manage centrally.
- [Path](./in-app-path-parameters.md) for URL segments that should not be exposed on the storefront.
- [Query](./in-app-query-parameters.md) for reusable query strings.
- [System](./in-app-system-parameters.md) auto-populated by APIEase for common Shopify context.
- [Flow](./in-app-flow-parameters.md) to map Shopify Flow tokens into your requests.

**How to add**
1. Open a request in the APIEase admin and click the plus icon in the Parameter column.
2. Choose the parameter location (Header, Body, Path, or Query), then enter the name and value.
3. Save the request. APIEase will inject these values whenever the request is executed.

**When to combine with dynamic parameters**
Use in-app parameters for anything sensitive or static. If you need runtime data from the storefront (such as cart info, page context, or user input), pair them with [dynamic embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md). Keep credentials and other confidential values in-app and server-side.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-header-parameters

TITLE
In-app header parameters

CONTENT
# In-app header parameters

You can add custom headers to any APIEase request directly from the request editor. Headers are used to provide additional context or authorization when making API calls. Common examples include Authorization, Content-Type, and custom authentication tokens.

**How to Add a Header Parameter**
While editing your request:
1. Click the plus icon in the Parameter column.
2. Select the **Header** radio button.
3. Enter the header name in the **Name** field.
4. Enter the header value in the **Value** field.
5. Click **Save** at the top of the request editor.

**Example Header Parameter:**
- **Name**: `Content-Type`
- **Value**: `application/json`

You can also use [embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) to dynamically set parameters from your storefront.

![In-app header parameter example](https://tawk.link/65552a3acec6a91282103248/kb/attachments/dbGjN5Waw6.png)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-body-parameters

TITLE
In-app body parameters

CONTENT
# In-app body parameters

You can add body content to any APIEase request directly from the request editor. Body parameters are used to send structured data to the receiving system, usually when making a POST, PUT, or PATCH request.

Body parameters are always entered as a complete JSON object. The name of the parameter is automatically set to body, so you only need to provide the value.

**How to Add a Body Parameter**

While editing your request:
1. Click the plus icon in the Parameter column.
2. Select the **Body** radio button.
3. Enter your JSON body in the **Value** field.
4. Click **Save** at the top of the request editor.

**Example Body Parameter**:

- **Name**: body (The body parameter name is systematically set to "body" and cannot be changed.)
- **Value**:

```json
{"arg1":"value1","arg2":"value2","arg3":"value3"}
```

You can also use [embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) to dynamically set parameters from your storefront.

![In-app body parameter entry](https://tawk.link/65552a3acec6a91282103248/kb/attachments/i0yOK5rG4k.png)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-path-parameters

TITLE
In-app path parameters

CONTENT
# In-app path parameters

You can add path parameters to any APIEase request directly from the request editor. Path parameters are used to replace [path variables](../path-variables.md) within your address.

**How to Add a Path Parameter**

While editing your request:
1. Click the plus button in the Parameter column of the request.
2. Select the **Path** radio button.
3. Enter the path parameter name in the **Name** field.
4. Enter the path parameter value in the **Value** field.
5. Click **Save** at the top.

**Example Path Parameter:**
- **Name**: `pathVariable1`
- **Value**: `inAppValue1`

If your API endpoint is structured as `https://ex.com/products/{pathVariable1}` the system will render the address as `https://ex.com/products/inAppValue1` at runtime.

You can also use [embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) to dynamically set parameters from your storefront.

![In-app path parameter configuration](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/path-variable-edit.png?v=1744137415)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-query-parameters

TITLE
In-app query parameters

CONTENT
# In-app query parameters

You can add query parameters to any APIEase request directly from the request editor. Query parameters are used to pass key-value pairs in the URL, usually for filtering, identifying, or paginating data in API requests.

**How to Add a Query Parameter**While editing your request, click the plus icon in the Parameter column.Select the Query radio button.Enter the name of your query parameter in the Name field.Enter the parameter value in the Value field.Click the Save button at the top of the request editor.**Query Parameter Example**:To add status=active to a request URL, enter the following:
While editing your request:
1. Click the plus icon in the Parameter column.
2. Select the **Query** radio button.
3. Enter the query parameter name in the **Name** field.
4. Enter the parameter value in the **Value** field.
5. Click **Save** at the top of the request editor.

**Query Parameter Example**  
To add `status=active` to a request URL:
- **Name**: `status`
- **Value**: `active`
Result: `https://ex.com/items?status=active` (additional query params are appended automatically).

You can also use [embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) to dynamically set parameters from your storefront.

![In-app query parameter configuration](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/in-app-query-parameters.png?v=1744835524)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-system-parameters

TITLE
In-app system parameters

CONTENT
# In-app system parameters

System parameters are special values that control how a request is handled by APIEase. Unlike headers, query parameters, or body values that are sent to the destination endpoint, system parameters affect the behavior of the request itself.

These parameters are managed directly in the request editor.

**How to Add a System Parameter**  
While editing your request:
1. Click the plus icon in the Parameter column.
2. Select the **System** radio button.
3. Enter the system parameter name in the **Name** field.
4. Enter the desired value in the **Value** field.
5. Click **Save** at the top of the request editor.

**System Parameter Example:**  
To require logged-in customers for validation, set `validateCustomer` to `true`.
- **Name**: `validateCustomer`
- **Value**: `true`
With `validateCustomer` set to true, the customer must be logged in for the call to pass validation and return a response to the storefront.

![In-app system parameter configuration](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/in-app-system-parameters.png?v=1744837315)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/in-app-parameters/in-app-flow-parameters

TITLE
In-app flow parameters

CONTENT
# In-app flow parameters

Flow parameters allow you to define the input data that will be passed to a Shopify Flow workflow when the request is executed. These parameters must match the input fields defined in your Flow template.

Flow parameters are configured directly in the request editor and entered as valid JSON.

**How to Add a Flow Parameter**

While editing your Flow request:
1. Click the plus icon in the Parameter column.
2. Select the **Flow** radio button.
3. Enter the **Name** you will use to access the flow parameter within your workflow.
4. In the **Value** field, enter your Flow input in JSON format.
5. Click **Save** at the top of the request editor.

**Flow Parameter Example:**

If your Flow expects a variable named `customer_data` that contains both an email and a customer tag, you could enter:
- **Name**: customer_data
- **Value**:

```json
{
  "email": "user@example.com",
  "tag": "VIP"
}
```

You can also use [embedded parameters](../dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) to dynamically set parameters from your storefront.

![In-app flow parameter fields](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/in-app-flow-parameters.png?v=1744838680)

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/dynamic-embedded-parameters-overview

TITLE
Dynamic embedded parameters overview

CONTENT
# Dynamic embedded parameters overview

**Dynamic Embedded Parameters From Storefront Overview**  
In some cases, it's not enough to define your request parameters statically in the APIEase admin. You may need to send information from your storefront that is only available at runtime, based on the customer's session, selections, or activity.

This is where dynamic embedded parameters come in.

With APIEase, you can pass query parameters, headers, or body content dynamically from your storefront using embedded placeholders. These dynamic values are injected into the request at the moment it is triggered from the storefront.

**Why Use Dynamic Embedded Parameters?**

Dynamic embedded parameters allow you to tailor each API request to the individual visitor, cart, or page context. Common use cases:
- Personalization: send a customer's name, email, or cart ID to an external service
- User input: capture form field values or product selections made on the page
- Session-based logic: include discount codes, location data, or referral info based on the current session
- Product data: pass information about the product being viewed or purchased
- Analytics or tracking: include context for tracking conversions, clicks, or customer actions

Without dynamic parameters, all values must be fixed in advance, which limits your ability to respond to customer behavior or use real-time data.

**Important Security Reminder**

Dynamic embedded parameters are useful for sending runtime information, but they should **never** be used to pass confidential credentials such as:

- Shopify access tokens
- API keys
- Usernames or passwords
- Secret authorization headers

The purpose of APIEase is to keep those credentials safe and hidden on the server side. If you include them in storefront JavaScript or Liquid, they become visible to anyone who visits your store.

If you need to authenticate with an external system and use a returned authentication code, you can use **APIEase chained requests**. In this setup, the first request performs the authentication, and the second request uses the returned token or session key. This keeps all confidential steps on the server and completely out of the storefront.

You can read more about [chained requests here](../chained-requests.md) and view an [authentication example here](../../../general/apiease-details/authentication-example.md).

Always store confidential credentials in the APIEase admin. Use dynamic parameters only for data that is safe to expose and specific to the current customer or page context.

**Flexible Placement**

You can embed dynamic values into:

- Query parameters
- Headers
- Request body
- Path segments

Each of these can be populated using JavaScript embedded in your storefront snippet. The data you pass is merged into the request structure when it is triggered, ensuring both flexibility and security.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/path-parameters

TITLE
Dynamic embedded path parameters

CONTENT
# Dynamic embedded path parameters

Unlike query, header and body embedded parameters that are always added as parameters to your request, path parameters are used exclusively for replacing path variables.

Dynamic embedded parameters are added as query parameters to calls made to APIEase from custom liquid in your storefront.

**Example Javascript Snippet:**

```javascript
const pathParamsEmbeddedVar = JSON.stringify({
  exampleParameter1: "exampleParameterValue1",
  exampleParameter2: "exampleParameterValue2",
  exampleParameter3: "exampleParameterValue3",
});
const pathParams = new URLSearchParams({
  requestId: "a1dd1880-ewsd-sdss-8f48-27f04dbadc32",
  pathParamsEmbedded: pathParamsEmbeddedVar,
});
fetch('/apps/apiease/integration/caller/call?' + pathParams)
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

In the above javascript snippet we see that  "**pathParamsEmbedded**" is set to the stringified "pathParamsEmbeddedVar".   APIEase looks for a query parameter named **pathParamsEmbedded**  to hold the dynamic embedded path parameters.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/body

TITLE
Dynamic embedded body

CONTENT
# Dynamic embedded body

You can pass dynamic values from the storefront into the body of a request using embedded parameters. This is useful when you want to include customer-specific or page-specific data inside a JSON body sent to an external API.

Dynamic embedded parameters are added as query parameters to calls made to APIEase from custom liquid in your storefront.

**Example Javascript Snippet:**

```javascript
const bodyEmbeddedVar = JSON.stringify({
  exampleBody1: "exampleBodyValue1",
  exampleBody2: "exampleBodyValue2",
  exampleBody3: "exampleBodyValue3",
});

const queryParams = new URLSearchParams({
  requestId: "a1dd1880-ewsd-sdss-8f48-27f04dbadc33",
  bodyEmbedded: bodyEmbeddedVar,
});

fetch('/apps/apiease/integration/caller/call?' + queryParams)
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

In the above javascript snippet we see that **bodyEmbedded**  is set to the stringified "bodyEmbeddedVar". APIEase looks for a query parameter named **bodyEmbedded**  to hold the dynamic embedded body parameters.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/headers

TITLE
Dynamic embedded headers

CONTENT
# Dynamic embedded headers

You can pass dynamic values from the storefront into the headers of an APIEase request. This is useful when the external API you are calling expects information such as customer details, session context, or custom identifiers to be included in the headers.

Dynamic embedded parameters are added as query parameters to calls made to APIEase from custom liquid in your storefront.

**Example Javascript Snippet:**

```javascript
const headerParamsEmbeddedVar = JSON.stringify({
  exampleHeader1: "exampleHeaderValue1",
  exampleHeader2: "exampleHeaderValue2",
  exampleHeader3: "exampleHeaderValue3",
});

const queryParams = new URLSearchParams({
  requestId: "a1dd1880-ewsd-sdss-8f48-27f04dbadc31",
  headersEmbedded: headerParamsEmbeddedVar,
});

fetch('/apps/apiease/integration/caller/call?' + queryParams)
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

In the above javascript snippet we see that **headersEmbedded**  is set to the stringified "headersEmbeddedVar". APIEase looks for a query parameter named **headersEmbedded**  to hold the dynamic embedded header parameters.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/query-parameters

TITLE
Dynamic embedded query parameters

CONTENT
# Dynamic embedded query parameters

Query parameters can be passed dynamically from the storefront using embedded values. This allows you to include real-time data in your request URLs, such as customer email addresses, cart information, or other storefront-specific details. Dynamic embedded query parameters are added directly to your request at execution time.

Dynamic embedded parameters are added as query parameters to calls made to APIEase from custom liquid in your storefront.

**Example Javascript Snippet:**

```javascript
const queryParamsEmbeddedVar = JSON.stringify({
  exampleParameter1: "exampleParameterValue1",
  exampleParameter2: "exampleParameterValue2",
  exampleParameter3: "exampleParameterValue3",
});

const queryParams = new URLSearchParams({
  requestId: "a1dd1880-ewsd-sdss-8f48-27f04dbadc30",
  queryParamsEmbedded: queryParamsEmbeddedVar,
});

fetch('/apps/apiease/integration/caller/call?' + queryParams)
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

In the above javascript snippet we see that **queryParamsEmbedded**  is set to the stringified "queryParamsEmbeddedVar".  APIEase looks for a query parameter named **queryParamsEmbedded**  to hold the dynamic embedded query parameters.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/dynamic-embedded-parameters/flow-parameters

TITLE
Dynamic embedded flow parameters

CONTENT
# Dynamic embedded flow parameters

You can pass dynamic values from your storefront into the input of a Shopify Flow request. This lets your Flow automation receive real-time data based on customer actions, session context, or storefront activity.

Dynamic embedded parameters are added as query parameters to calls made to APIEase from custom Liquid in your storefront.

**Example JavaScript snippet**

```html
<script>
  const flowParamsEmbeddedVar = JSON.stringify({
    exampleFlow1: "exampleFlowValue1",
    exampleFlow2: "exampleFlowValue2",
    exampleFlow3: "exampleFlowValue3",
  });
  const queryParams = new URLSearchParams({
    requestId: "a1dd1880-ewsd-sdss-8f48-27f04dbadc31",
    flowParamsEmbedded: flowParamsEmbeddedVar,
  });
  fetch('/apps/apiease/integration/caller/call?' + queryParams)
    .then(function (response) {
      return response.json();
    })
    .then(function (jsonResponse) {
      console.log(jsonResponse);
    });
</script>
```

In the snippet above, `flowParamsEmbedded` is set to the stringified `flowParamsEmbeddedVar`. APIEase looks for a query parameter named `flowParamsEmbedded` to hold the dynamic embedded flow parameters.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/form-urlencoded-bodies

TITLE
Form URL-encoded bodies

CONTENT
# Form URL-encoded bodies

APIEase supports raw text request bodies when the request Content-Type is `application/x-www-form-urlencoded`. In this mode, the body is treated as a plain string instead of JSON, so form-style payloads like `productId=sku-123&quantity=2` are sent exactly as written.

## When to use this

Use form URL-encoded bodies when the receiving API expects classic HTML form submissions or legacy form payloads.

## How it works

- The request **Content-Type** header must be set to `application/x-www-form-urlencoded`.
- The **Body** parameter value is stored and sent as raw text.
- Embedded body parameters from the storefront (`bodyEmbedded`) are appended as additional form fields.
- Previous response data (when present) is appended as additional form fields.

## Example

**Headers**

- `Content-Type`: `application/x-www-form-urlencoded`

**Body**

```
productId=sku-123&quantity=2
```

**Embedded body parameters (from storefront)**

```json
{
  "warehouse": "north-2",
  "priority": "high"
}
```

**Previous response data (optional)**

```json
{
  "receiptId": "rcpt-789"
}
```

**Final request body sent**

```
productId=sku-123&quantity=2&warehouse=north-2&priority=high&receiptId=rcpt-789
```

## Notes

- If you need to encode special characters, URL-encode them in the body or embedded values.
- For JSON request bodies, keep using the standard JSON body parameter flow described in [In-app body parameters](./in-app-parameters/in-app-body-parameters.md).

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/path-variables

TITLE
Path variables

CONTENT
# Path variables

Portions of your address path can be set from variables at execution time. Variables in your path are replaced by in app path parameters or dynamic embedded path parameters.

You include variables in your path surrounded with double braces.

Example Address Path Containing a Variable:

`https://ex.com/{variable1}`

Any in app path parameter or pathParamsEmbedded with the name variable1 will replace the path variables value you place in your address path. Multiple path variables can be added.

In the example above we have:

Address:  `https://ex.com/{variable1}`

Path Parameter:  

   Name: variable1

   Value: inAppValue1

When the request is executed the address will resolve to:  https://ex.com/inAppValue1

![Path variable editing in APIEase](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/path-variable-edit.png?v=1744137415)

The system replaces variables in the path within curly brackets `{}` with the value specified in a path parameter.

For storefront APIEase calls via app proxy you can also set the path variable via a dynamic embedded path parameter.

```javascript
const pathParamsEmbeddedVar = JSON.stringify({
  variable1: "dynamicEmbeddedPathValue1",
});
const queryParams = new URLSearchParams({
  requestId: "a375c890-14a5-11f0-941a-f549b30199d1",
  pathParamsEmbedded: pathParamsEmbeddedVar,
});
fetch('/apps/apiease/integration/caller/call?' + queryParams)
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

The parameter named `variable1` in `pathParamsEmbedded` will replace `{variable1}` in your address path.

When the request is executed from your storefront via app proxy the address will resolve to: `https://ex.com/dynamicEmbeddedPathValue1`

In app path parameters act as the default parameter. Dynamic embedded parameters override the in app parameter values.

If you only have the in app `variable1=inAppValue1` then address  `https://ex.com/{variable1}` will resolve to `https://ex.com/inAppValue1`.

If you have the in app `variable1 = inAppValue1` and `pathParamsEmbedded = JSON.stringify({ variable1: "dynamicEmbeddedPathValue1" })` then address `https://ex.com/{variable1}` will resolve to `https://ex.com/dynamicEmbeddedPathValue1`. So dynamic embedded parameters override the default in app path parameters of the same name.

SOURCE
https://docs.apiease.com/docs/requests/triggers/triggers-overview

TITLE
Triggers overview

CONTENT
# Triggers overview

Every APIEase request uses the same configuration but can be invoked in different ways depending on where the call originates. Choose the trigger that best matches your workflow and follow the linked guides for setup details.

## [Webhooks](./webhooks/trigger-requests-from-a-webhook.md)
- Start a request automatically when Shopify emits a webhook event.
- Ideal for reacting to store activity such as orders, carts, or customers.
- See also [Mapping webhook parameters](./webhooks/mapping-webhook-parameters.md) to pass webhook fields into your request.

## [Cron Schedule](./cron-schedule.md)
- Execute a request on a fixed schedule without any external event.
- Use for regular syncs, polling, or time-based jobs.

## [Proxy Endpoint](./proxy-endpoint.md)
- Expose a stable endpoint that forwards incoming HTTP calls to a configured request.
- Helpful when another system needs to call APIEase without knowing the internal request id.

## [Manual Calls](./manual-calls.md)
- Run a request directly from the admin for testing or one-off actions.
- Best for validating configuration before exposing the request to any external source.

## [Storefont Calls](./storefont-calls.md)
- Let theme code call a request via Shopify's app proxy without exposing secrets.
- Great for customer-facing interactions that need server-side execution.
- Works with [Customer authenticated requests](../customer-authenticated-requests.md) to access customer context securely.

## [Widget Calls](./widget-calls.md)
- Trigger requests from APIEase widgets on the storefront.
- A reusable alternative to pasting request snippets into theme code.
- See [Using Requests in Widgets](../../widgets/using-requests-in-widgets.md) for the widget-side configuration.

## [Remote Calls](./calling-requests-remotely.md)
- Invoke a request from outside Shopify using APIEase's remote caller API.
- Use when automation or third-party systems must trigger requests directly.

## [Chained Request](../request-parameters/chained-requests.md)
- Trigger a follow-on request using the output of a previous one.
- Useful for multi-step flows such as authenticate-then-call or data enrichment.

SOURCE
https://docs.apiease.com/docs/requests/triggers/webhooks/webhooks-overview

TITLE
Webhooks overview

CONTENT
# Webhooks overview

Use Shopify webhooks to start APIEase requests automatically when store events occur. This is ideal for reacting in real time to orders, carts, customers, and other updates without polling. You can add a webhook trigger to any request. See the [Shopify webhook topics](https://shopify.dev/docs/api/admin-graphql/2023-10/enums/WebhookSubscriptionTopic) for available events.

## [Trigger requests from a webhook](./trigger-requests-from-a-webhook.md)
- Configure how to start requests from webhook events.

## [Mapping webhook parameters](./mapping-webhook-parameters.md)
- Map webhook payload fields into your request parameters.

SOURCE
https://docs.apiease.com/docs/requests/triggers/webhooks/trigger-requests-from-a-webhook

TITLE
Trigger requests from a webhook

CONTENT
# Trigger requests from a webhook

This guide shows how to configure a webhook trigger in APIEase. Shopify maintains the full list of [webhook topics](https://shopify.dev/docs/api/admin-graphql/2023-10/enums/WebhookSubscriptionTopic).

![Webhook trigger selection](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/trigger-webhook-http.png?v=1744409941)

## Add a webhook trigger
1. In the APIEase admin, open the request (click the edit icon if needed).
2. In the **Trigger** column, click the plus icon.
3. Select **Webhook**.
4. Choose the Shopify webhook event (for example `orders/create`, `customers/update`, or `carts/update`).

After saving, APIEase will execute the request every time that event is received from Shopify.

![Webhook trigger for Flow](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/trigger-webhook-flow.png?v=1744409941)

## Example: webhook-triggered Flow request
If you want to start a Shopify Flow automation whenever a cart updates:
1. Create a new request and select **Flow** as the request type.
2. Choose your Flow template and fill required parameters.
3. Add a webhook trigger and select `carts/update`.

Each cart update triggers the request and starts the Flow. Any webhook fields you need can also be mapped into Flow input parameters.

## Webhook payload as body
When the request is triggered, the webhook payload is passed as the body.

- Base body (example from `discounts/create`):
```json
{
  "admin_graphql_api_id": "gid://shopify/DiscountAutomaticNode/1",
  "title": "Automatic free shipping",
  "status": "ACTIVE",
  "created_at": "2016-08-29T12:00:00-04:00",
  "updated_at": "2016-08-29T12:00:00-04:00"
}
```
- If you add body parameters, they are merged:
```json
{
  "admin_graphql_api_id": "gid://shopify/DiscountAutomaticNode/1",
  "title": "Automatic free shipping",
  "status": "ACTIVE",
  "created_at": "2016-08-29T12:00:00-04:00",
  "updated_at": "2016-08-29T12:00:00-04:00",
  "additional_body_parameter": "some_value"
}
```
- If your body parameters override a webhook field, the original is preserved with `_0` suffix:
```json
{
  "admin_graphql_api_id": "gid://shopify/DiscountAutomaticNode/1",
  "title": "Title that I prefer",
  "title_0": "Automatic free shipping",
  "status": "ACTIVE",
  "created_at": "2016-08-29T12:00:00-04:00",
  "updated_at": "2016-08-29T12:00:00-04:00"
}
```

To pull specific payload values into headers, query params, or body fields, see [Mapping webhook parameters](./mapping-webhook-parameters.md).

SOURCE
https://docs.apiease.com/docs/requests/triggers/webhooks/mapping-webhook-parameters

TITLE
Mapping webhook parameters

CONTENT
# Mapping webhook parameters

When a Shopify webhook triggers a request in APIEase, the full webhook payload is forwarded as the request body. You can map any field from that payload into query parameters, headers, or body fields that your endpoint expects.

**How mapping works**

Add a parameter to your request with:
- **Type**: Query, Header, or Body
- **Name**: The name expected by the destination endpoint
- **Value**: A reference to the webhook payload field, wrapped in curly braces

## Example: simple payload value
For the `products/delete` webhook, the payload includes:

```json
{
  "id": 788032119674292922
}
```

To send this value as a query parameter named `deleted_product_id`, add:
- Type: Query
- Name: `deleted_product_id`
- Value: `{id}`

This pulls the `id` field from the webhook and renders an address like `https://example.com?deleted_product_id=788032119674292922`.

![Mapping a webhook payload field to a query parameter](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/mapping-webhook-parameter-query.png?v=1744666126)

## Example: nested payload value
If the value you need is nested, use dot notation. For the `product_listings/remove` webhook, the payload includes:

```json
{
  "product_listing": {
    "product_id": 788032119674292922
  }
}
```

To pass the nested `product_id` value to your endpoint, set the parameter value to `{product_listing.product_id}` (as a query, header, or body value depending on what the endpoint requires).

## Tips
- The webhook payload is already the request body; additional body parameters you add are merged into that body.
- Use descriptive parameter names so the rendered request matches what your downstream API expects.

SOURCE
https://docs.apiease.com/docs/requests/triggers/cron-schedule

TITLE
Cron Schedule

CONTENT
# Cron Schedule

Use the built-in scheduler when you need a request to run at fixed times without any webhook or manual trigger.

## Add a cron schedule
1. Open the request and click the edit icon if needed.
2. In the **Trigger** column, click the plus icon.
3. Select **Cron**.
4. Enter a cron expression (minute, hour, day-of-month, month, day-of-week) such as `0 * * * *` for hourly or `0 2 * * *` for 2 AM daily.
5. Save. APIEase will run the request whenever the expression matches.

## Tips
- Cron uses a 5-field format: minute, hour, day of month, month, day of week.
- Use `*/15 * * * *` for every 15 minutes, `0 9 * * 1-5` for 9 AM on weekdays, and `0 0 1 * *` for the first day of each month.
- Make sure the request has all required parameters so the scheduled runs succeed without manual input.

SOURCE
https://docs.apiease.com/docs/requests/triggers/proxy-endpoint

TITLE
Proxy Endpoint

CONTENT
# Proxy Endpoint

Create a public API endpoint that executes an APIEase request and returns its final response to the caller—no custom server needed.

## Endpoint format
Your proxy endpoint URL looks like:
```
https://app-admin.apiease.com/api/proxy/<shop-name>/<your-path>
```
- `<shop-name>` identifies your shop.
- `<your-path>` is the custom path you choose for this endpoint.

When someone calls this URL using the HTTP method you specify (GET, POST, etc.), APIEase runs the linked request and relays the request’s final response to the caller. This is useful for lightweight APIs, receiving events, or letting external systems start your workflows.

## How it works
1. The first path segment after `/proxy/` identifies your shop.
2. The remaining path is the custom endpoint path you configure.
3. APIEase matches the incoming request to your Proxy Endpoint.
4. APIEase runs the configured request using the incoming data.
5. The request’s final response is returned to the caller.

## Authentication options
- **Authenticated**: Caller must authenticate using the same scheme as Remote API Calls.
- **Unauthenticated**: Open access for anyone with the URL.

## Configure a proxy endpoint trigger
1. Open any APIEase request.
2. Click the plus icon under **Triggers**.
3. Select the **Proxy Endpoint** radio button.
4. Set:
   - **Request Path**: The public endpoint path.
   - **HTTP Method**: The allowed verb for the endpoint.
   - **Authenticated**: `true` or `false`.
5. Save. Your public API endpoint is ready to use.

SOURCE
https://docs.apiease.com/docs/requests/triggers/manual-calls

TITLE
Manual calls

CONTENT
# Manual calls

You can run any configured APIEase request on demand from the admin interface. This is useful for testing, debugging, or performing one-off actions without setting up a trigger.

## Run a manual call
1. Open the APIEase admin and go to **Requests**.
2. Find the request you want to run and click the **Copy and Execute** button in the **Actions** column.
3. Click the **Execute and Run** button. APIEase executes the request immediately.
4. View the response and execution details in the run output.

## Tips
- Manual runs use the same configuration as other triggers (storefront, webhook, schedule, etc.), so they are a safe way to validate request logic before exposing it externally.
- If a run fails, use the response details to adjust parameters or request configuration, then run again.

SOURCE
https://docs.apiease.com/docs/requests/triggers/storefont-calls

TITLE
Storefront calls

CONTENT
# Storefront calls

Run any APIEase request directly from your Shopify storefront using Shopify's app proxy. This lets you start workflows from theme code without exposing credentials or private logic in the browser.

If you want a more convenient and reusable way to make storefront calls, use [Widget Calls](./widget-calls.md) and trigger the request from an APIEase widget instead of pasting snippets into theme Liquid.

## Caution
Use caution with Storefront App Proxy requests. Anyone from anywhere can call Storefront App Proxy requests. APIEase verifies that Storefront App Proxy requests have been routed through the Shopify App Proxy and that a Storefront App Proxy trigger has been added to your request. However, anyone can call this request via the Shopify App Proxy just as you can from your storefront.

## How it works
- Your theme calls the APIEase app proxy path (for example `/apps/apiease/integration/caller/call`) and includes the `requestId` for the request to run.
- Shopify forwards the call through the app proxy. If the customer is logged in, Shopify passes the customer id to APIEase.
- APIEase executes the request on the server, injects any sensitive parameters you saved in the admin, and returns the request's final response to the storefront.

## Add Storefront Request
1. Go to the Requests page.
2. Click the plus icon at the top left of the page.
3. At a minimum, set your Address and Method.
4. If you want to call this request from your storefront, you must add the `Storefront App Proxy` trigger.
5. Click **Save** at the top of the screen.

## Call from your theme
Use the copied snippet as-is to verify the integration, then extend it with any [dynamic embedded parameters](../request-parameters/dynamic-embedded-parameters/dynamic-embedded-parameters-overview.md) you need for runtime data.

```html
<script>
  const queryParams = new URLSearchParams({
    requestId: "e4234d0-5b0a-11ee-9e5d-195679c7ea93b",
  });
  fetch('/apps/apiease/integration/caller/call?' + queryParams).
    then(function(response) {return response.json();}).
    then(function(jsonResponse) {console.log(jsonResponse);});
</script>
```

- `requestId` tells APIEase which request to run; this value is filled in when you click **Copy**.
- Add `pathParamsEmbedded`, `queryParamsEmbedded`, `headersEmbedded`, `bodyEmbedded`, or `flowParamsEmbedded` as needed to pass dynamic embedded parameters from the storefront.
- Keep confidential values stored in the APIEase request configuration; do not place secrets in storefront code.

## Customer validation options
If the customer is logged in when the app proxy runs, Shopify includes their customer id in the call.

- Require a logged-in customer: add a system parameter named `validateCustomer` with value `true`.
- Restrict to a specific customer: add a system parameter named `customerId` set to the allowed Shopify customer id.

For detailed setup and screenshots, see [Customer authenticated requests](../customer-authenticated-requests.md). If validation fails, APIEase blocks the call and no response is returned to the storefront.

SOURCE
https://docs.apiease.com/docs/requests/triggers/widget-calls

TITLE
Widget Calls

CONTENT
# Widget Calls

Widgets are reusable storefront components managed inside APIEase. They can render UI and call requests. If you have not used widgets before, start with [Widgets overview](../../widgets/widgets-overview.md).

Widget Calls are a trigger type for APIEase requests. They are a more convenient, reusable way to make [Storefront Calls](./storefont-calls.md), and they replace manually pasting request snippets into theme Liquid.

## How it works
- The widget runs in the browser.
- The widget triggers the request.
- The request executes on the server and returns a response.

To configure the widget-side request call, see [Using Requests in Widgets](../../widgets/using-requests-in-widgets.md).

## Security warning
Widgets run in the browser and are inspectable. Sensitive credentials must not be placed in widgets. Configure credentials inside the APIEase request where they are stored securely. Treat all widget inputs as untrusted.

SOURCE
https://docs.apiease.com/docs/requests/triggers/calling-requests-remotely

TITLE
Calling APIEase Requests Remotely

CONTENT
# Calling APIEase Requests Remotely

You can call any APIEase request from any http client by making a direct HTTP request to the APIEase platform. This allows you to run your configured requests from outside Shopify, such as from custom servers, external apps, or third-party platforms.

**Step 1**: Create an API Key

1. Navigate to the Settings page in the APIEase admin.
2. Click **Generate API Key**.
3. Copy and store the key securely. You will use this key to authenticate your external calls.

**Step 2**: Make the Remote Call

**Address**: `https://app-admin.apiease.com/api/remote/caller/call?requestId=<your_request_id>`

**Headers:**
- `x-shop-myshopify-domain`: `yourstore.myshopify.com`
- `x-apiease-api-key`: `<your_generated_api_key>`

Replace `<your_request_id>` with the ID of the request you want to call. You can find the `requestId` in the APIEase request admin page.

SOURCE
https://docs.apiease.com/docs/requests/request-parameters/chained-requests

TITLE
Chained requests

CONTENT
# Chained requests

Chained requests allow you to call one request after another, using the response from the first request as input to the second. This is especially useful when working with systems that require multi-step interactions, such as authentication followed by data access.

For example, you might need to:

- Authenticate with an external service
- Receive an access token in the response
- Use that token to make a second request to retrieve data or perform an action

**Setting Next Request**

Set the request id or request name of the next request you would like to call in the **Next Request** field.

**How Chaining Works in APIEase**

Each request in APIEase can optionally trigger another request once it completes. The second request can use values from the first request's response body as parameters.

Let's say you have two requests:

- Request A: Authenticates with a service and receives a token
- Request B: Uses that token to call a protected endpoint

Here's an example of what the JSON response from Request A might look like:

```json
{
  "auth": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  }
}
```
In Request B, you can reference the token value using curly braces:

`Authorization: Bearer {auth.token}`
This tells APIEase to pull the token field from the auth object in the JSON response and insert it into the header of the second request.

![Chained request editor overview](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/chained-requests-description.png?v=1744331402)

**Flexible Use of Response Data**

You can use response values from Request A in multiple parts of Request B:

- Query parameters
- Headers
- Request body
- URL paths

For example, suppose Request A returns the following JSON:

```json
{
  "user": {
    "id": "abc123",
    "email": "user@example.com"
  }
}
```
You could then use those values in Request B like this:

- In a query string: `?user_ref={user.id}`
- In a header: `X-User-Email: {user.email}`
- In the body:

```json
{
  "ref_id": "{user.id}"
}
```
The curly brace syntax tells APIEase to substitute in the corresponding value from the previous response.

**A Real-World Example**

If you want to see this in action, we've created a walkthrough of a common use case: authenticating with a service, storing the returned access token, and using it in a follow-up request.

[View Authentication Example](../../general/apiease-details/authentication-example.md)

**When to Use Chained Requests**

Use chained requests when:

- You need to authenticate before calling a protected API
- You need to transform or fetch dynamic data before continuing
- You want to build multi-step workflows inside APIEase without building and hosting a custom backend

SOURCE
https://docs.apiease.com/docs/requests/shopify-flow-integration/architecture

TITLE
APIEase + Shopify Flow integration architecture

CONTENT
# APIEase + Shopify Flow integration architecture

APIEase and Shopify Flow play different roles. Use Flow for logic and native Shopify actions, and use APIEase to call external APIs, handle credentials, and pass responses into Flow.

## Core philosophy
- Shopify Flow is the logic engine: branching, conditions, and Shopify-native actions.
- APIEase is the API execution layer: authenticated API calls, scheduling, response handling, and triggering Flow when needed.

## Why start in APIEase
- You need to call external APIs (ERP, warehouse, AI, CRM, etc.).
- You need to store or use credentials that Flow should not handle.
- You need the API response available inside Flow (Flow’s native HTTP action does not return a response).
- You want flexible triggers: schedules, webhooks, storefront actions, or manual runs.

## Example architecture
1. Start in APIEase: fetch or receive data from an external system.
2. Chain a Flow request: send the response into Shopify Flow via the APIEase Flow trigger.
3. Use Flow logic: run conditions, evaluate the data, or transform it with Run Code.
4. Optional follow-up call: chain another APIEase request to update an external system based on Flow output.

## When to call Shopify APIs
- Use Flow’s native Send Admin API Request when it is simple and credential-free.
- Prefer APIEase when the call needs credentials, depends on another API’s response, or is part of a larger chained workflow.

## Common use cases
- Import products or inventory from external systems.
- Push Shopify order data to ERPs or 3PLs.
- Sync inventory with a warehouse.
- Call third-party AI or recommendation engines.
- React to webhooks with chained logic plus outbound API calls.
- Build backend workflows without a custom app.

## Summary
Put APIEase at the edges (inbound/outbound APIs, credentials, chaining) and Flow in the middle as the logic engine. If a workflow touches external services or credentialed calls, start or end in APIEase and run the logic in Flow.

SOURCE
https://docs.apiease.com/docs/requests/shopify-flow-integration/add-flow-request

TITLE
How to add a Flow request in APIEase

CONTENT
# How to add a Flow request in APIEase

Follow these steps to create a Flow request and send data into Shopify Flow.

1. Go to **Requests** in APIEase.
2. Click the **Add Request** plus button in the upper-left corner.
3. (Optional) Name the request (for example, `Flow - Inventory Update`).
4. Set **Request type** to **Flow** so the request triggers a Shopify Flow workflow.
5. (Optional) Add **Flow** parameters with any JSON you want to send into the workflow.
6. (Optional) Chain this Flow request from another request by setting it as the **Next Request** of the prior step.
7. Save the request.

SOURCE
https://docs.apiease.com/docs/requests/shopify-flow-integration/minimal-flow-integration

TITLE
Minimal Flow integration with APIEase

CONTENT
# Minimal Flow integration with APIEase

Use this quick setup to trigger Shopify Flow from APIEase and capture Flow output.

1. Create a **Flow** request in APIEase.
2. In Shopify Flow, build a workflow that uses the **APIEase Flow Trigger**.
3. Add a **Condition** step to ensure the incoming `requestId` matches your Flow request.
4. Add the **APIEase Flow Action** and return a variable named `flowParameters`.

> Important: If Flow does not return `flowParameters`, APIEase still responds, but the Flow-produced details are omitted. APIEase waits for the Flow action runtime call to finish before sending the final response to the original requester.

SOURCE
https://docs.apiease.com/docs/requests/shopify-flow-integration/cat-image-inventory

TITLE
APIEase integrated with Shopify Flow - Cat image inventory

CONTENT
# APIEase integrated with Shopify Flow - Cat image inventory

This demo shows how a storefront button triggers APIEase, Shopify Flow, and a chained GraphQL call to adjust inventory based on a cat image’s width.

![APIEase request chain](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/flow-cat-image-inventory-requests.png?v=1743029544)

## How the demo works
1. A storefront button calls an APIEase proxy endpoint.
2. APIEase calls The Cat API to fetch a random image (includes width/height).
3. The Cat API response is passed to Shopify Flow via a chained Flow request.
4. Flow runs logic to classify the image size (small, medium, large).
5. Flow returns the matching location and inventory item to APIEase.
6. A final APIEase request calls Shopify GraphQL to increment the correct variant’s inventory.
7. The storefront shows success or error after the mutation completes (Shopify inventory updates may take a moment to appear).

## APIEase request chain
1. **Request #1: The Cat API**  
   - Name: `Flow - Cat Images - Get Cat`  
   - Type: `http`  
   - Address: `https://api.thecatapi.com/v1/images/search`  
   - Method: `GET`  
   - Next Request: `Flow - Cat Images - Add Cat`  
   - Sample response:
     ```json
     {
       "data": [
         {
           "id": "ced",
           "url": "https://cdn2.thecatapi.com/images/ced.jpg",
           "width": 720,
           "height": 960
         }
       ],
       "status": 200
     }
     ```
   The response is forwarded as `previousRequestResponse` into the Flow request.

2. **Request #2: Shopify Flow (APIEase Flow Trigger)**  
   - Name: `Flow - Cat Images - Add Cat`  
   - Type: `flow`  
   - Next Request: `Flow - Cat Images - Increment Inventory`  
   - Incoming Flow parameters:
     ```json
     {
       "requestFlowParameters": {},
       "previousRequestResponse": {
         "0": {
           "id": "ced",
           "url": "https://cdn2.thecatapi.com/images/ced.jpg",
           "width": 720,
           "height": 960
         }
       },
       "executionId": "99524b60-0b4d-11f0-8ea0-67506abcdec8"
     }
     ```
   - Flow adds `incrementInventoryParameter` (location and inventory item) and returns:
     ```json
     {
       "status": 200,
       "data": {
         "requestFlowParameters": {},
         "previousRequestResponse": {
           "0": {
             "id": "ced",
             "url": "https://cdn2.thecatapi.com/images/ced.jpg",
             "width": 720,
             "height": 960
           }
         },
         "executionId": "99524b60-0b4d-11f0-8ea0-67506abcdec8",
         "incrementInventoryParameter": {
           "location": "gid://shopify/Location/80446030117",
           "inventoryItemId": "gid://shopify/InventoryItem/52358268420389"
         }
       }
     }
     ```

This example uses an explicit `X-Shopify-Access-Token` header for the Shopify Admin API call. For automatic shop access token usage and overrides, see [Automatic vs overridden Shopify access tokens](../../general/shopify-api/automatic-vs-overridden-shopify-access-tokens.md).

3. **Request #3: Shopify GraphQL**  
   - Name: `Flow - Cat Images - Increment Inventory`  
   - Type: `http`  
   - Address: `https://store-apiease-admin-local.myshopify.com/admin/api/2025-01/graphql.json`  
   - Method: `POST`  
   - Headers:  
     - `X-Shopify-Access-Token`: `[access-token]`  
     - `Content-Type`: `application/json`  
   - GraphQL body (uses Flow output for replacements):
     ```json
     {
       "query": "mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {  inventoryAdjustQuantities(input: $input) {  userErrors { field message }  inventoryAdjustmentGroup {  createdAt reason changes { name delta }  }  }  }",
       "variables": {
         "input": {
           "reason": "correction",
           "name": "available",
           "changes": [
             {
               "delta": 1,
               "inventoryItemId": "{incrementInventoryParameter.inventoryItemId}",
               "locationId": "{incrementInventoryParameter.location}"
             }
           ]
         }
       }
     }
     ```

## Shopify Flow workflow
1. Trigger: **apiease-flow-trigger**.
2. Condition: Confirm the incoming `requestId` matches the Flow request.
3. Action: Shopify **Get location data** to retrieve variants and locations.
4. Action: **Run Code** to classify image size and select the matching inventory item.
5. Action: **apiease-flow-action** to return Flow parameters (including `incrementInventoryParameter`) to APIEase.

![Shopify Flow workflow](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/flow-cat-image-inventory-workflow.png?v=1743029544)

### Run Code inputs
```graphql
query {
  getLocationData {
    id
    inventoryLevels {
      item {
        id
        sku
        variant {
          title
          sellableOnlineQuantity
        }
      }
    }
  }
  flowParameters
}
```

### Run Code script
```javascript
export default function main(input) {
  const { getLocationData, flowParameters } = input;
  const flowParametersObject = JSON.parse(flowParameters);
  const firstImage = flowParametersObject.previousRequestResponse['0'];
  const width = firstImage?.width;

  if (typeof width !== 'number') {
    return { message: 'Image width not found or invalid.', targetSize: null };
  }

  let targetSize;
  if (width < 400) {
    targetSize = 'Small';
  } else if (width < 800) {
    targetSize = 'Medium';
  } else {
    targetSize = 'Large';
  }

  if (!Array.isArray(getLocationData) || getLocationData.length === 0) {
    return { message: 'No location data found.' };
  }

  const incrementInventoryParameter = {};
  for (const location of getLocationData) {
    for (const level of location.inventoryLevels) {
      const item = level.item;
      const variant = item?.variant;
      if (variant?.title === targetSize) {
        incrementInventoryParameter.location = location.id;
        incrementInventoryParameter.inventoryItemId = item.id;
      }
    }
  }

  flowParametersObject.incrementInventoryParameter = incrementInventoryParameter;
  const flowParametersStringified = JSON.stringify(flowParametersObject);
  return { message: flowParametersStringified };
}
```

The Run Code step classifies the image size and attaches `incrementInventoryParameter` so APIEase can substitute those values in the GraphQL mutation.

![Run Code setup](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/flow-cat-image-inventory-run-code.png?v=1743118558)

### APIEase Flow Action

![APIEase Flow Action variables](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/flow-cat-image-inventory-action-variable.png?v=1743120408)

SOURCE
https://docs.apiease.com/docs/requests/examples/facebook-graph-api

TITLE
Facebook Graph API example

CONTENT
# Facebook Graph API example

This demo page calls the Facebook Graph API through APIEase to fetch album photos and render them on a Shopify storefront.

- Demo: `https://apiease-demo.myshopify.com/pages/facebook-album-1` (password `eacoht`)
- Endpoints used:
  - Photo: `https://developers.facebook.com/docs/graph-api/reference/photo/`
  - Album photos: `https://developers.facebook.com/docs/graph-api/reference/album/photos/`

## JavaScript
```javascript
let dumpId = null;

async function getPhoto(photoId) {
  const pathParamsEmbeddedVar = JSON.stringify({ photoId });
  const getPicturesQueryParams = new URLSearchParams({
    pathParamsEmbedded: pathParamsEmbeddedVar,
    requestId: '69782d80-63b8-11ee-b950-ff5a55fbe301',
  });

  const res = await fetch(
    '/apps/apiease/integration/caller/call?' + getPicturesQueryParams,
    { headers: { 'ngrok-skip-browser-warning': 'any' } },
  );

  if (!res.ok) {
    console.error('Failed to fetch the data. Status code: ' + res.status);
    return;
  }

  const json = await res.json();
  const imageData = json.data.images;
  const imageByHeight = imageData.find((image) => image.height === 130);
  if (!imageByHeight) return;

  const imageUrl = imageByHeight.source;
  document.getElementById('facebookResponseDisplay').innerHTML +=
    `<img class="fbPhotos" src="${imageUrl}">`;
}

async function callApi() {
  const pathParamsEmbeddedVar = JSON.stringify({ albumId: '122103599360059617' });
  const getAlbumQueryParams = new URLSearchParams({
    pathParamsEmbedded: pathParamsEmbeddedVar,
    requestId: '24d5bb60-63c8-11ee-b950-ff5a55fbe301',
  });

  const res = await fetch(
    '/apps/apiease/integration/caller/call?' + getAlbumQueryParams,
    { headers: { 'ngrok-skip-browser-warning': 'any' } },
  );

  if (!res.ok) {
    console.error('Failed to fetch the data. Status code: ' + res.status);
    return;
  }

  const json = await res.json();
  const albumData = json.data.data;
  for (const item of albumData) {
    await getPhoto(item.id);
  }
}

callApi();
```

## HTML
```html
<div id="demoHtml">
  <div>
    You can call <a target="_blank" href="https://developers.facebook.com/docs/graph-api">Facebook Graph API</a>
    to retrieve content from Facebook.
  </div>
  <div>
    The following images from the
    <a target="_blank" href="https://www.facebook.com/media/set/?set=a.122103599360059617&type=3">APIEase Facebook Page</a>
    are being retrieved from the Facebook Graph API via APIEase.<br>
  </div>

  <div class="response-box">
    APIEase Response:
    <div id="facebookResponseDisplay"></div>
  </div>
</div>
```

## CSS
```css
#demoHtml * {
  font-family: 'Helvetica Neue', sans-serif;
}
#demoHtml button {
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.response-box {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e6ecff;
  margin-top: 10px;
}
.fbPhotos {
  outline: 1px solid #000;
  margin: 20px;
}
```

SOURCE
https://docs.apiease.com/docs/requests/examples/http-dump

TITLE
HTTP Dump example

CONTENT
# HTTP Dump example

This demo uses HTTP Dump to inspect requests sent from APIEase.

- Demo: `https://apiease-demo.myshopify.com/pages/http-dump` (password `eacoht`)
- Endpoints used: `https://httpdump.app/create-dump` and `https://httpdump.app/dumps`

## JavaScript
```javascript
let dumpId = null;

async function callApi() {
  if (dumpId === null) {
    const createDumpQueryParams = new URLSearchParams({
      requestId: 'd58be5e0-5b0a-11ee-9e5d-19ff9c7e593b',
    });

    const res = await fetch(
      '/apps/apiease/integration/caller/call?' + createDumpQueryParams,
      { headers: { 'ngrok-skip-browser-warning': 'any' } },
    );

    if (res.ok) {
      const json = await res.json();
      const temp = document.createElement('div');
      temp.innerHTML = json.data;
      const titleText = temp.querySelector('title')?.textContent;
      dumpId = titleText?.split(' - ')[1];

      document.getElementById('apiEaseResponse').innerHTML =
        'See that a POST was made to HTTP Dump here: ' +
        `<a href="https://httpdump.app/inspect/${dumpId}" target="_blank">` +
        `https://httpdump.app/inspect/${dumpId}</a>`;
    } else {
      console.error('Failed to fetch the data. Status code: ' + res.status);
    }
  }

  const queryParamsEmbeddedVar = document.getElementById('queryParameter').value;
  const headersEmbeddedVar = document.getElementById('headerParameter').value;
  const bodyEmbeddedVar = document.getElementById('bodyParameter').value;
  const pathParamsEmbeddedVar = JSON.stringify({ dumpId });

  const callDumpQueryParams = new URLSearchParams({
    requestId: 'e4edbbd0-5b0a-11ee-9e5d-19ff9c7e593b',
    queryParamsEmbedded: queryParamsEmbeddedVar,
    headersEmbedded: headersEmbeddedVar,
    bodyEmbedded: bodyEmbeddedVar,
    pathParamsEmbedded: pathParamsEmbeddedVar,
  });

  const res = await fetch(
    '/apps/apiease/integration/caller/call?' + callDumpQueryParams,
    { headers: { 'ngrok-skip-browser-warning': 'any' } },
  );

  if (res.ok) {
    await res.json(); // response logged in HTTP Dump
  }
}

document.getElementById('submitButton').addEventListener('click', callApi);
document.getElementById('queryParameter').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    callApi();
  }
});
```

## HTML
```html
<div id="demoHtml">
  <div>
    HTTP Dump is an excellent resource for testing your APIEase requests.<br>
    Submit the following form to see APIEase call an HTTP Dump address.
  </div>
  <div style="display: flex;">
    <div style="flex: 1; padding-right: 10px;">
      <label for="queryParameter">Query Parameter:</label>
      <input type="text" id="queryParameter" style="width: 100%;" value='{"queryParam1": "queryValue1"}'>
      <label for="headerParameter">Header:</label>
      <input type="text" id="headerParameter" style="width: 100%;" value='{"queryParam1": "queryValue1"}'>
      <label for="bodyParameter">Body:</label>
      <input type="text" id="bodyParameter" style="width: 100%;" value='{"bodyParam1": "bodyValue1"}'>
    </div>
  </div>
  <button id="submitButton">Submit</button>

  <div class="response-box">
    APIEase Response:
    <div id="apiEaseResponse"></div>
  </div>
</div>
```

## CSS
```css
#demoHtml * {
  font-family: 'Helvetica Neue', sans-serif;
}
#demoHtml button {
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.response-box {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e6ecff;
  margin-top: 10px;
}
```

SOURCE
https://docs.apiease.com/docs/requests/examples/cat-api

TITLE
Cat API example

CONTENT
# Cat API example

This demo calls The Cat API via APIEase and displays a random cat image.

- Demo: `https://apiease-demo.myshopify.com/pages/auth-api` (password `eacoht`)
- Endpoint: `https://api.thecatapi.com/v1/images/search`

## JavaScript
```javascript
function callApi() {
  const queryParamsCaller = new URLSearchParams({
    requestId: '72277ed0-db24-11ed-b56c-119d120a4914',
  });

  fetch('/apps/apiease/integration/caller/call?' + queryParamsCaller, {
    headers: { 'ngrok-skip-browser-warning': 'any' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => {
      document.getElementById('catApiResponseImage').src = jsonResponse.data[0].url;
    });
}
```

## HTML
```html
<div id="demoHtml">
  <div id="catApiDemo">
    <div style="display: flex; align-items: center;">
      <p>The Cat API returns random images of cats.</p>
      <button onclick="callApi()">Get</button>
    </div>
    <div class="response-box">
      APIEase Response:<br>
      <img id="catApiResponseImage">
    </div>
  </div>
 </div>
```

## CSS
```css
#demoHtml * {
  font-family: 'Helvetica Neue', sans-serif;
}
#demoHtml button {
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.response-box {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e6ecff;
  margin-top: 10px;
}
```

SOURCE
https://docs.apiease.com/docs/requests/examples/agify-api

TITLE
Agify API example

CONTENT
# Agify API example

This demo calls the Agify API through APIEase to estimate age based on a name.

- Demo: `https://apiease-demo.myshopify.com/pages/open-api` (password `eacoht`)
- Endpoint: `https://api.agify.io?name=Jo`

## JavaScript
```javascript
function callApi() {
  const agifyInputName = document.getElementById('agifyInputName').value;
  const queryParamsEmbedded = JSON.stringify({ name: agifyInputName });
  const queryParamsCaller = new URLSearchParams({
    requestId: '14d572d0-db21-11ed-b56c-119d120a4914',
    queryParamsEmbedded,
  });

  fetch('/apps/apiease/integration/caller/call?' + queryParamsCaller)
    .then((response) => response.json())
    .then((jsonResponse) => {
      document.getElementById('ageifyResponseAge').innerHTML =
        'Agify thinks you are ' + jsonResponse.data.age + '.';
    });
}

document.getElementById('submitButton').addEventListener('click', callApi);
document.getElementById('agifyInputName').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    callApi();
  }
});
```

## HTML
```html
<div id="demoHtml">
  <p><a href="https://agify.io/" target="_blank">Agify</a> will guess your age based on your name.</p>
  <div>
    <label for="agifyInputName">Name:</label>
    <input type="text" id="agifyInputName">
    <button id="submitButton">Submit</button>
  </div>
  <div class="response-box">
    APIEase Response:
    <p id="ageifyResponseAge"></p>
  </div>
</div>
```

## CSS
```css
#demoHtml * {
  font-family: 'Helvetica Neue', sans-serif;
}
#demoHtml button {
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.response-box {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #e6ecff;
  margin-top: 10px;
}
```

SOURCE
https://docs.apiease.com/docs/requests/customer-authenticated-requests

TITLE
Customer authenticated requests

CONTENT
# Customer authenticated requests

You can authenticate request calls from your storefront.

Http calls from your storefront to APIEase are made using the [Shopify App Proxy](https://shopify.dev/docs/apps/online-store/app-proxies). If the customer is logged into your store then the customer id is sent to APIEase.

## Automatic customer ID injection

Need to inject the logged-in customer ID into request values? See [Automatic Shopify Customer ID Injection](../general/apiease-details/automatic-shopify-customer-id-injection.md).

## Customer Validation Options

You can restrict api calls to a particular request in APIEase by logged in customer in one of 2 ways:

1. Automatically validate all logged in customers.

Set "validateCustomer" to true as a System parameter.

![Validate customer system parameter toggle](https://tawk.link/65552a3acec6a91282103248/kb/attachments/zy4MAt-qUF.png)

With "validateCustomer" set to true the customer must be logged into your store in order for the api call to pass validation and return a response to your storefront.

2. Validate individual customer ids by associating requests with individual customer ids.

Include customer id as System parameter with name: "customerId" and value: "individual customer id".

![Customer id system parameter example](https://tawk.link/65552a3acec6a91282103248/kb/attachments/zFgy2rIovc.png)

If request parameters are owned by individual customer you will need to add a separate request with each particular customer's parameters and customer id as a System parameter.

If you add customer id to a request that customer must be logged into the store in order for the api call to pass validation and return a response to your storefront.

SOURCE
https://docs.apiease.com/docs/functions/functions-page

TITLE
Functions page

CONTENT
# Functions page

The Functions page lets you create reusable Liquid helpers that can be called from [Liquid Requests](../requests/request-types/liquid-requests.md).

Functions run inside the parent Liquid request execution. They are not standalone requests, do not have their own triggers, and do not count as separate request executions.

## Open the Functions page

In the APIEase admin, select **Functions** from the main navigation.

## What you can do

- View all saved functions for the current shop
- Create a new function
- Open an existing function and update it
- Duplicate a function as a starting point for a variation
- Delete functions you no longer need

## Functions list

The Functions page shows a table with five columns:

- **Name**: The function name. Select the name or the edit action to open the function.
- **Type**: Currently `liquid`.
- **Description**: The saved description. If no description is set, APIEase shows a short Liquid preview instead.
- **Last updated**: The last saved date.
- **Actions**: Edit, duplicate, or delete the function.

Additional list behavior:

- Use the **Add function** button to create a new function.
- If a delete is in progress, the row is dimmed and marked **Will be deleted**.
- If no functions exist yet, the page shows `No functions yet.`

## Create or edit a function

Each function includes these fields:

- **Name**: Required. This is the function name you call from Liquid.
- **Description**: Optional. Use it to explain what the function returns or when to use it.
- **Type**: Currently fixed to `liquid`.
- **Parameters**: Optional parameter definitions for the function.
- **Liquid**: Required. The Liquid code that runs when the function is called.

The editor supports the same save bar behavior used elsewhere in APIEase:

- The save bar appears when you make changes.
- Use **Save** to persist the function.
- Use **Discard** to return to the last saved version.

## Function parameters

Each parameter row includes:

- **Name**: Required
- **Description**: Optional
- **Type**: Required metadata

Supported parameter types:

- `string`
- `number`
- `boolean`
- `object`
- `array`

Important behavior:

- Parameter types are descriptive metadata for this version of Functions. They help document expected inputs, but APIEase does not strictly enforce them at runtime.
- Parameter names must be unique within a function.
- Only declared parameters are exposed inside the function body.

## How Functions behave

Functions are intended to reduce repetition inside Liquid request logic.

Use a Function when you want to:

- Reuse the same Liquid transformation in multiple places
- Standardize formatting or response shaping
- Keep Liquid requests shorter and easier to maintain

Do not use a Function when you need:

- An external API call
- A webhook, schedule, or manual trigger
- A standalone execution target

For invocation syntax and runtime examples, see [Using Functions in Liquid Requests](./using-functions-in-liquid-requests.md).

SOURCE
https://docs.apiease.com/docs/functions/using-functions-in-liquid-requests

TITLE
Using Functions in Liquid Requests

CONTENT
# Using Functions in Liquid Requests

APIEase Functions are reusable Liquid helpers that run inside a parent [Liquid Request](../requests/request-types/liquid-requests.md).

When a Liquid request calls a Function:

- The Function runs in process as part of the parent Liquid request
- The Function does not create a separate request execution
- The Function does not add separate request charges

## The function tag

Use the `function` tag to call a saved Function and assign its result to a variable.

Basic syntax:

```liquid
{% function build_summary(customer.firstName) as summary %}
{{ summary }}
```

`as <name>` is required. APIEase assigns the Function result to that alias and you can use it later in the template.

## Inline positional syntax

The simplest syntax is an inline function call by name:

```liquid
{% function format_price(product.price, cart.currency.iso_code) as formattedPrice %}
{{ formattedPrice }}
```

Arguments are matched to the saved parameter definitions in order.

If your Function defines these parameters:

1. `amount`
2. `currency`

Then the example above maps:

- `product.price` to `amount`
- `cart.currency.iso_code` to `currency`

Supported inline argument styles include:

- String literals
- Number literals
- Boolean literals
- `null`
- Liquid variables and simple Liquid expressions

Example:

```liquid
{% function build_summary("Kevin, Jr.", 42, true, null, customer.firstName | append: " Smith") as summary %}
{{ summary.message }}
```

## Object syntax

You can also call a Function with a JSON object. This is useful when you want named arguments or want to resolve the Function dynamically.

Example using `functionName`:

```liquid
{% function {
  "functionName": "build_summary",
  "args": {
    "firstName": "{{ customer.firstName }}",
    "lastName": "{{ customer.lastName }}"
  }
} as summary %}
{{ summary.message }}
```

Example using `functionId`:

```liquid
{% function {
  "functionId": "function-123",
  "args": {
    "amount": "{{ product.price }}",
    "currency": "{{ cart.currency.iso_code }}"
  }
} as result %}
{{ result }}
```

You can also pass a variable that already contains the invocation object:

```liquid
{% function functionInput as summary %}
{{ summary.message }}
```

This form is useful when your Liquid context already includes a prebuilt function input object.

## Accessing parameters inside the Function

Inside the saved Function body, each declared parameter is available as a Liquid variable by its parameter name.

If your Function declares:

- `firstName`
- `lastName`

Then the Function body can use:

```liquid
{{ firstName }}
{{ lastName }}
```

Important behavior:

- Only declared parameters are exposed inside the Function body.
- Missing arguments resolve to `null`.
- Extra positional arguments are rejected with an error.

## Return behavior

A Function returns whatever its Liquid body renders.

If the rendered output is valid JSON, APIEase parses it before assigning the alias. This lets a Function return:

- Objects
- Arrays
- Numbers
- Booleans
- `null`

If the rendered output is not valid JSON, APIEase returns trimmed text.

String example:

```liquid
Hello {{ firstName }}
```

Object example:

```liquid
{
  "message": "Hello {{ firstName }}",
  "name": "{{ firstName }}"
}
```

Then call it like this:

```liquid
{% function build_summary(customer.firstName, customer.lastName) as summary %}
{{ summary.message }}
```

## Example: reusable title builder

Saved Function:

```liquid
{{ prefix }} {{ title | strip }}
```

Declared parameters:

- `prefix`
- `title`

Liquid Request:

```liquid
{% function build_title("Sale:", product.title) as computedTitle %}

{% call {
  "requestId": "create-tagline",
  "bodyEmbedded": {
    "title": computedTitle
  }
} as response %}

{{ response.status }}
```

## Guardrails and errors

APIEase includes a few protections for Functions:

- Recursive Function calls are not allowed.
- Nested Function calls are limited to a maximum depth of 10.
- Calling a missing Function raises an error.
- Malformed inline invocation syntax raises an error.
- Omitting `as <name>` raises an error.

## When to use Functions vs. Requests

Use a Function when you need reusable Liquid logic.

Use a [Liquid Request](../requests/request-types/liquid-requests.md) when you need the overall executable workflow.

Use an [HTTP Request](../requests/request-types/http-requests.md), [Flow Request](../requests/request-types/flow-requests.md), or [System Request](../requests/request-types/system-requests.md) when you need to call an external or app-managed operation.

SOURCE
https://docs.apiease.com/docs/variables/variables-page

TITLE
Variables page

CONTENT
# Variables page

The Variables page lets you manage persisted shop variables for the current store directly from the APIEase admin.

These are the same variables used by [System Requests](../requests/request-types/system-requests.md), so you can manage values manually in the admin or read and write them programmatically in request flows.

## Open the Variables page

In the APIEase admin, select **Variables** from the main navigation.

## What you can do

- View all saved variables for the current shop
- Create a new variable
- Open an existing variable and update its value
- Mark a variable as sensitive so its value stays masked in the UI
- Delete variables you no longer need

## Variables list

The Variables page shows a table with four columns:

- **Name**: The variable name. Select the name or the edit action to open the variable.
- **Value**: The current value summary. Non-sensitive values are shown directly. Sensitive values are masked.
- **Sensitive**: Shows `Yes` or `No`.
- **Actions**: Edit or delete the variable.

Additional list behavior:

- Use the **Add variable** button to create a new variable.
- If a value is long, the list truncates it for display.
- If a delete is in progress, the row is dimmed and marked **Will be deleted**.
- If no variables exist yet, the page shows `No variables yet.`

## Create a variable

To create a variable:

1. Open the **Variables** page.
2. Select **Add variable**.
3. Enter a **Name**.
4. Enter a **Value**.
5. Turn on **Sensitive** if the value should stay hidden after it is saved.
6. Use the save bar to save the variable.

Notes:

- `Name` is required when creating a variable.
- The save bar appears when you make changes.
- You can use **Discard** in the save bar to abandon unsaved edits.

## Edit a variable

To edit a variable:

1. Open the variable from the list.
2. Update the **Value** and, if needed, the **Sensitive** checkbox.
3. Save from the save bar.

Important behavior:

- After a variable is created, its **Name** is read-only.
- Existing sensitive values stay masked in the editor. If you leave the masked value as-is and save, APIEase keeps the stored value.
- If you want to replace a sensitive value, type a new value before saving.
- If you turn off **Sensitive** for an existing masked variable, enter the replacement plain-text value before saving because APIEase does not reveal the stored secret back into the form.

## Delete a variable

Use the delete action in the list to remove a variable.

Delete applies immediately. Unlike staged changes on some other pages, there is no separate bulk save step for deletions on the Variables page.

## When to use the Variables page vs. System Requests

Use the Variables page when you want to manage values manually in the admin.

Use [System Requests](../requests/request-types/system-requests.md) when you want to set, get, or delete variables as part of an automated flow.

SOURCE
https://docs.apiease.com/docs/widgets/widgets-overview

TITLE
Widgets overview

CONTENT
# Widgets overview

APIEase widgets are reusable storefront UI components that you build and manage in APIEase, then render in your Shopify theme through the APIEase theme app block. A widget can output Liquid (markup) and optionally run JavaScript, which makes it a good fit for UI that needs to stay flexible but still integrate with your backend logic.

## Why widgets are useful

- **UI + secure API requests, together:** Widgets help you connect storefront UI components to secure API requests powered by APIEase, without moving secrets or request logic into the theme.
- **Rich UI with Liquid + JavaScript:** Liquid plus inline JavaScript and external JavaScript libraries lets you build interactive, dynamic widgets while still relying on APIEase for secure request execution.
- **Easy placement anywhere:** The Storefront block extension makes it straightforward to inject simple or complex API-integrated UI components anywhere in your store using the Theme Editor.

## Learn more

Learn more about the [Widgets page](./widgets-page.md) to manage and organize your widgets, the [Widget edit page](./widget-edit-page.md) to configure a widget's Liquid, JavaScript, and handle, and the [Storefront block extension](./storefront-block-extension.md) to add a widget to your theme and control where it renders.

SOURCE
https://docs.apiease.com/docs/widgets/widgets-page

TITLE
Widgets page

CONTENT
# Widgets page

The Widgets page is where you manage reusable storefront widgets. Each widget has a handle, Liquid template, and optional JavaScript that can be rendered in a theme app block.

## What you can do

- View every widget by name and handle
- See JavaScript status (None, Inline, External (#), or Disabled)
- Add a new widget
- Edit widgets
- Duplicate or delete widgets and save or discard staged changes

## Widget list table

The table shows each widget with the name, handle, JavaScript status, and actions for edit, duplicate, and delete. Use it to confirm which widgets have JavaScript enabled before you place them in a theme.

When you duplicate or delete a widget, the change is staged in the table:

- Staged duplicates appear as new rows labeled **Staged duplicate**.
- Deletes dim the row and show **Will be deleted**.
- Actions for staged rows are disabled until you save or discard.

## Staged changes and save bar

Duplicate and delete actions do not apply immediately. They are staged and collected until you choose what to do:

- **Save** applies all staged duplicates and deletions.
- **Discard** cancels staged changes and returns to the last saved list.

## Create a widget

Select **Add Widget** (the plus button) to open the widget editor. This is where you define the Liquid template, optional JavaScript, and handle you will reference in your theme.

SOURCE
https://docs.apiease.com/docs/widgets/widget-edit-page

TITLE
Widget edit page

CONTENT
# Widget edit page

The widget editor is where you define how a widget renders and behaves. Use it to set the widget name, handle, Liquid template, and optional JavaScript.

## Widget fields

### Widget name

The display name used in the Widgets list. When you create a new widget, the handle is auto generated from the name until you manually edit the handle.

### Widget handle

The identifier used by the storefront block to load the widget. Keep this stable if the widget is already used in a theme, and update the theme block if you change it.

### Liquid template

The Liquid markup that renders inside the widget container. Use it to output HTML and Liquid variables needed by the storefront.

### External JavaScript URLs

One URL per line. APIEase loads these scripts when the widget renders.

### JavaScript

Inline JavaScript that runs after the widget HTML is inserted on the page. Use it for widget specific behavior.

### Disable JavaScript

When checked, the widget renders its Liquid template but does not load any JavaScript from the inline or external fields.

## Save and delete

- The save bar appears when you make changes.
- **Save** applies your edits.
- **Discard** reverts to the last saved version.
- Delete widgets from the Widgets page (deletions are staged and saved there).

## AI widget builder

Use the assistant panel to generate or refine a widget draft. When you accept a draft, the editor updates the Liquid and JavaScript fields so you can review and save.

SOURCE
https://docs.apiease.com/docs/widgets/storefront-block-extension

TITLE
Storefront block extension

CONTENT
# Storefront block extension

Widgets render in your storefront through the APIEase theme app block. The block loads the widget by handle and injects its Liquid and JavaScript into the page.

## Before you start

- Create and save a widget in APIEase.
- Copy the widget handle from the widget editor.
- In Shopify Theme Editor, enable the **APIEase Widget App Embed** (you typically only need to do this once per theme).

## Add the widget to your theme

1. Open Shopify admin and go to **Online Store** -> **Themes**.
2. Select **Customize** on the theme you want to update.
3. Open **App embeds** and enable **APIEase Widget App Embed**, then save.
4. Navigate to the page or template where the widget should appear.
5. Add the **APIEase App Block** block to the section.
6. Paste the widget handle into the **Widget handle** setting.
7. Save the theme changes.

## Update or move a widget

- If you change the widget handle, update the block setting to match.
- To move the widget, remove the block from the current section and add it to the new location.

## Troubleshooting

- If the block shows "Widget handle not configured", confirm the handle value is set and saved.
- If the widget does not render, confirm **APIEase Widget App Embed** is enabled and that the handle matches exactly.

SOURCE
https://docs.apiease.com/docs/widgets/using-requests-in-widgets

TITLE
Using Requests in Widgets

CONTENT
# Using Requests in Widgets

Widgets can call APIEase requests. The widget runs in the browser, but the request runs on the server. This separation keeps integrations secure by keeping credentials and private logic off the storefront.

## Configure a request call
1. Get the `requestId` for the request you want to run (from the request admin page).
2. In the widget edit page, the **Liquid** field is required; you can use a simple placeholder like `<div></div>`.
3. Paste the JavaScript below into the widget's **JavaScript** field to call the APIEase integration endpoint with `fetch` and read the JSON response:

```js
const queryParams = new URLSearchParams({
  requestId: 'YOUR_REQUEST_ID',
});

fetch('/apps/apiease/integration/caller/call?' + queryParams)
  .then(function (response) {
    return response.json();
  })
  .then(function (jsonResponse) {
    console.log(jsonResponse);
  });
```

## Security warning
Never place sensitive credentials (API keys, access tokens, passwords) in a widget. Widgets are delivered to the browser and are inspectable. Configure credentials inside the APIEase request so they are stored securely and only used on the server.

SOURCE
https://docs.apiease.com/docs/general/faq/faq

TITLE
FAQ

CONTENT
# FAQ

## Do I need a Shopify access token or API Key to call the Shopify Admin API?
In many cases, no. APIEase can automatically inject the shop access token for Shopify Admin API calls when the request address triggers token injection.

Two common ways to trigger automatic injection:
1. Select the [Shopify Admin GraphQL address preset](../shopify-api/shopify-admin-graphql-address-preset.md) in the request address dropdown for an HTTP request. This fills the correct shop admin GraphQL address and triggers APIEase to inject the shop access token, so you do not need to add an `X-Shopify-Access-Token` header manually.
2. Use a Shopify Admin GraphQL request address that matches your shop domain and api path like this: `https://yourstore.myshopify.com/admin/api/2025-10/graphql.json` so the address pattern triggers APIEase token injection.

## What is my Shopify access token or API Key?
If you're using APIEase to call the Shopify Admin API, you usually do not need to find a token or API key yourself. APIEase will automatically inject the shop access token when the request address triggers using token injection as described here: [Shopify Admin GraphQL address preset](../shopify-api/shopify-admin-graphql-address-preset.md)).
If you still want to obtain and use a custom Shopify access token, follow the [Custom access token](../shopify-api/custom-access-token.md) instructions.

SOURCE
https://docs.apiease.com/docs/general/settings/apiease-api-key

TITLE
APIEase API Key

CONTENT
# APIEase API Key

The APIEase API Key shown on the **Settings** page is strictly for authenticating remote API calls into APIEase.
It is not a Shopify access token and cannot be used to call Shopify APIs directly.

## When to use it

Use this key for Remote Calls (calling APIEase Requests remotely from an external system).

See: [Remote Calls](../../requests/triggers/calling-requests-remotely.md)

## Add an API key

1. In APIEase, open the **Settings** page.
2. In **API Key Name**, enter a descriptive name (for example, `production`, `staging`, or `ci`).
3. Click **Add**.
4. Copy the generated key and store it securely (for example, in a password manager or secret manager).

If you lose a key, create a new one and update any systems that use it.

## What it is not

This is different from the shop access token APIEase uses to call the Shopify Admin API:
[Shop access token](../shopify-api/shop-access-token.md)

## Security

Treat this key like a secret (store securely, create separate keys per system, rotate by deleting/creating keys).

SOURCE
https://docs.apiease.com/docs/general/apiease-details/ip-address-whitelisting

TITLE
APIEase IP address for whitelisting

CONTENT
# APIEase IP address for whitelisting

APIEase makes API calls from a fixed IP address. This is useful if the external system you are calling requires IP whitelisting for security purposes.

The IP address used by APIEase for all outgoing requests is **34.117.76.19**.

This address is static and does not change.

Use Case ExampleSome systems, like ERP or warehouse management platforms, require incoming API calls to originate from a known IP address. Shopify does not provide a fixed IP address range for native webhook or Flow executions, but APIEase gives you a reliable, fixed IP for secure integration.

By using APIEase to make your API calls, you can meet the IP whitelisting requirements of your external systems while still reacting to events in Shopify such as new orders, inventory changes, or customer updates.

SOURCE
https://docs.apiease.com/docs/general/apiease-details/importing-third-party-products

TITLE
Importing products from a third-party system

CONTENT
# Importing products from a third-party system

You can use [Liquid requests](../../requests/request-types/liquid-requests.md) to automate the import of products and inventory data from third-party systems into your Shopify store. You can also import using [Shopify Flow Integration](../../requests/shopify-flow-integration/architecture.md). Liquid integration is recommended over Flow integration because it can be configured by the APIEase AI assistant. Whether syncing from a warehouse API, supplier feed, or internal catalog, APIEase enables this process without requiring custom app development or hosting.

**Recommended: Liquid integration**
Liquid requests let you fetch products, loop through the response, and post each product into Shopify. This keeps the entire import inside APIEase and makes it easier to adjust the logic with the AI assistant.

**Quick Liquid example**
1. Create an HTTP request that calls the third-party products API.
2. Create an HTTP request that calls the Shopify Admin API to create or update products.
3. Use a Liquid request to connect them:

```liquid
{% call { "requestId": "third-party-products-request-id" } as source %}

{% for product in source.data.products %}
  {% call {
    "requestId": "shopify-product-upsert-request-id",
    "bodyEmbedded": {
      "title": "{{ product.title }}",
      "vendor": "{{ product.vendor }}",
      "variants": [
        { "sku": "{{ product.sku }}", "price": "{{ product.price }}" }
      ]
    }
  } as upsert %}
  {{ upsert.status }}
{% endfor %}
```

More detailed examples of Liquid integrations are coming soon.

**Flow integration (alternative)**
1. **Start with an APIEase Request**: Create an APIEase request to fetch product and inventory data from the third-party system. Trigger it manually, on a schedule, or via a Shopify webhook event.
2. **Pass the Response to Shopify Flow**: Use a chained request to send the data to a Shopify Flow workflow configured by store administrators or developers.
3. **Process the Data in Flow**: Inside Flow, use a Run Code action to transform, validate, or filter the received data.
4. **Import into Shopify**: Use the Send Admin API request action in Flow to call Shopify's GraphQL Admin API to create or update products and inventory.

**Why Use APIEase**
While Shopify Flow provides native actions for updating product data, most real-world integrations require:
- Authenticated API calls to third-party systems
- The ability to schedule imports
- Access to response data from external APIs
- Dynamic control over how data flows into Shopify

APIEase handles these responsibilities, enabling you to build a complete product import pipeline within your Shopify environment.

SOURCE
https://docs.apiease.com/docs/general/apiease-details/automatic-shopify-customer-id-injection

TITLE
Automatic Shopify Customer ID Injection

CONTENT
# Automatic Shopify Customer ID Injection

APIEase can replace `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}` at runtime with the logged-in Shopify customer ID from the current storefront request.

You can use this placeholder in any value context where variable replacement is supported, including:

- Header parameter values
- Query parameter values
- Body parameter values
- Address values via path parameters
- System parameter values
- Liquid parameter values
- Liquid request values via Liquid parameters
- Flow parameter values

## Examples

### Header value

Set a header parameter like:

- Name: `X-Customer-Id`
- Value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

At runtime, APIEase resolves it to the logged-in customer ID (for example `1234567890`).

### Query value

Set a query parameter like:

- Name: `customerId`
- Value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

Resulting call example:

```text
https://api.example.com/orders?customerId=1234567890
```

### Body value

Use the placeholder inside JSON body values:

```json
{
  "customerId": "{SHOPIFY_LOGGED_IN_CUSTOMER_ID}",
  "action": "sync"
}
```

At runtime, `customerId` is replaced with the logged-in Shopify customer ID.

### Address value (via path parameter)

If your URL uses a path parameter, set that parameter value to the placeholder:

- URL template: `https://api.example.com/customers/{customerId}/orders`
- Path parameter `customerId` value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

Resolved runtime URL example:

```text
https://api.example.com/customers/1234567890/orders
```

### System parameter value

You can also use the placeholder as a system parameter value. Example:

- Name: `customerId`
- Value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

This is useful when downstream request logic expects customer ID as a system value.

### Liquid request values via Liquid parameters

Liquid request variables are always defined through Liquid parameters, then referenced in the template.

Set a Liquid parameter:

- Name: `customerId`
- Value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

Then use it in the Liquid request:

```liquid
{% call {
  "requestId": "customer-orders",
  "queryParamsEmbedded": {
    "customerId": "{customerId}"
  }
} as response %}
{{ response.status }}
```

### Flow parameter value

In Flow request parameters, set a value such as:

- Name: `customerId`
- Value: `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}`

At runtime, APIEase resolves this to the logged-in customer ID before executing the request.

## Prerequisite

This only works when the request runs in Shopify app proxy/storefront context where Shopify provides `logged_in_customer_id`.

## Recommended validation

Set system parameter `validateCustomer=true` so requests fail fast when no customer is logged in.

## Behavior when no logged-in customer is available

If no logged-in Shopify customer ID is available, `{SHOPIFY_LOGGED_IN_CUSTOMER_ID}` is not resolved.

With `validateCustomer=true`, APIEase blocks the request during validation. Without it, the unresolved placeholder may continue downstream as a literal value.

SOURCE
https://docs.apiease.com/docs/general/apiease-details/authentication-example

TITLE
Authentication example

CONTENT
# Authentication example

Many external APIs require authentication before you can access their data or services. This usually involves sending a login request to receive an access token, which must then be included in subsequent requests.

With APIEase, you can handle this securely using chained requests - without ever exposing your credentials in the storefront.

**Step 1: Create the Authentication Request**

Start by setting up your first request to authenticate with the external service. This is typically a POST request with your client credentials in the body.

Example:

- Method: `POST`
- URL: [https://example.com/api/authenticate](https://example.com/api/authenticate)
- Body:

```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

This request will return an access token in the response. For example:

```json
{
  "auth_token": "abc123xyz"
}
```

**Step 2: Create the Follow-Up Request**

Next, create a second request to access the secured endpoint. Let's call it "SecureRequest".

This request will use the auth_token returned from the authentication request.

For example, you might need to include the token in a header:

- Type: Header  
- Name: `Authorization`
- Value: `Bearer {auth_token}`

Or include it in the body:

- Type: Body  
- Value:

```json
{
  "session_token": "{auth_token}"
}
```

**Step 3: Chain the Requests**

Go back to your authentication request and set the Next Request field to the name of your follow-up request (in this case, "SecureRequest").

When the authentication request completes successfully, APIEase will automatically execute the next request and insert the token where specified.

![Chained requests example](https://cdn.shopify.com/s/files/1/0733/1820/3680/files/chained-requests-example.png?v=1744331402)

**Secure by Design**

All credentials and tokens stay on the server and are never exposed to the storefront or customer browser. This ensures a secure authentication flow without needing to build your own app or server.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/shopify-api-calls-and-access-tokens

TITLE
Shopify API calls and access tokens

CONTENT
# Shopify API calls and access tokens

APIEase can call the Shopify Admin API on your behalf. It uses the [shop access token](./shop-access-token.md) that was issued during Shopify OAuth and stored for the shop. If for some reason you need to use a [custom access token](./custom-access-token.md) you can override the system injected shop access token.

[Manage shop access token permissions](./manage-shop-access-token-permissions.md) controls which scopes are granted to the shop access token. When you request new scopes, Shopify reauthorizes the app and issues an updated shop access token with the new permissions.

## Key concepts
- [Automatic token usage](./automatic-vs-overridden-shopify-access-tokens.md#automatic-shop-access-token-usage): APIEase injects the shop access token when a request targets the Shopify Admin API and no override token is provided.
- [Override token usage](./automatic-vs-overridden-shopify-access-tokens.md#overridden-custom-access-token-usage): A request includes an explicit `X-Shopify-Access-Token` header and APIEase uses that token instead of the shop access token.
- [Shop access token](./shop-access-token.md): The Shopify OAuth token stored for the shop and used for Shopify Admin API calls.
- [Custom access token](./custom-access-token.md): A standalone token you generate and provide explicitly when a request must use a different Shopify Admin API token.
- [Scope and permissions](./manage-shop-access-token-permissions.md): The specific Shopify Admin API permissions granted to the shop access token, and the reauthorization flow that updates it after scope changes.

## Caution on write permissions
Write permissions allow APIEase to create, update, or delete store data when triggered by configured requests, flows, schedules, webhooks, or proxy endpoints. This capability is powerful and potentially destructive if used incorrectly, and some write operations cannot be reversed.

APIEase does not validate the business correctness of your requests. It executes requests exactly as configured using the permissions you approve.

We strongly recommend backing up relevant store data or testing write-enabled requests in a non-production environment before enabling write permissions. You are responsible for request correctness, safe testing, and any data changes or deletions caused by those requests.

## When to use what
- Use automatic token usage for most Shopify Admin API calls inside APIEase.
- Use an override token when a call must run with a different token for a different shop or with permissions that need to differ from the Shop access token.
- Update scopes on [Manage shop access token permissions](./manage-shop-access-token-permissions.md) when a request needs new Shopify Admin API access.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/automatic-vs-overridden-shopify-access-tokens

TITLE
Automatic vs overridden Shopify access tokens

CONTENT
# Automatic vs overridden Shopify access tokens

APIEase determines how to authenticate Shopify Admin API requests based on the request address and headers. It does not validate business correctness. It executes requests exactly as configured.

## Automatic shop access token usage
APIEase injects the [shop access token](./shop-access-token.md) when a request targets the Shopify Admin API and no override token is provided. This is useful because you do not need to generate a token manually, you do not need to configure a token header in each request, and you can update its permissions quickly on [Manage shop access token permissions](./manage-shop-access-token-permissions.md). For the fastest setup, select the [Shopify Admin GraphQL address preset](./shopify-admin-graphql-address-preset.md) in the request address dropdown to ensure the request qualifies for automatic token usage.

## Overridden custom access token usage
APIEase overrides your shop access token when you provide a [custom access token](./custom-access-token.md) in an explicitly set `X-Shopify-Access-Token` header. This is useful when a call must run under a different Shopify token, such as testing a separate app, using a token from another shop, or matching permissions that differ from the stored shop access token.

## Decision rules
1. If the request targets a Shopify Admin API endpoint and no explicit override token is provided, APIEase injects the shop access token automatically.
2. If the request includes an `X-Shopify-Access-Token` header, APIEase treats it as an explicit override and uses that token instead of the shop access token.
3. If the request does not target a Shopify Admin API endpoint, APIEase does not inject the shop access token. The request behaves like any other outbound HTTP call.

## What counts as a Shopify Admin API endpoint
APIEase treats an address as a Shopify Admin API endpoint when:
- The address path starts with `/admin/api`.
- The address host matches the shop domain for the current shop.

Common Admin API patterns include:
- `https://yourstore.myshopify.com/admin/api/2024-07/graphql.json`
- `https://yourstore.myshopify.com/admin/api/2024-07/products/count.json`

## Examples

### GraphQL request with automatic token usage
This request targets the Shopify Admin API and does not include an override token. APIEase adds the shop access token automatically.

- Address: `https://yourstore.myshopify.com/admin/api/2024-07/graphql.json`
- Method: `POST`
- Headers:
  - `Content-Type`: `application/json`
- Body:

```json
{
  "query": "query { shop { name } }"
}
```

### GraphQL request with an override token
This request includes an `X-Shopify-Access-Token` header. APIEase uses the override token instead of the shop access token.

- Address: `https://yourstore.myshopify.com/admin/api/2024-07/graphql.json`
- Method: `POST`
- Headers:
  - `X-Shopify-Access-Token`: `your-override-token`
  - `Content-Type`: `application/json`
- Body:

```json
{
  "query": "query { shop { name } }"
}
```

### REST request example
The Shopify REST Admin API is deprecated. Only use REST if you understand the impact and you have a specific need.

- Address: `https://yourstore.myshopify.com/admin/api/2024-07/products/count.json`
- Method: `GET`
- Headers:
  - `X-Shopify-Access-Token`: `your-override-token`

## What the UI communicates
When a request targets the Shopify Admin API, the request editor uses labels to show which token is used:
- Automatically using shop access token.
- Overriding shop access token.

## Troubleshooting
- 401 Unauthorized usually means the token is missing or invalid.
- 403 Forbidden usually means the token is valid but missing the required scope.
- Missing scope symptoms include access denied errors or empty data where the Admin API expects permissions.
- Token override mistakes include using the wrong shop domain, using an expired token, or entering the header name or value incorrectly.
- Confirm granted scopes on [Manage shop access token permissions](./manage-shop-access-token-permissions.md) and reauthorize if you need more access.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/shopify-admin-graphql-address-preset

TITLE
Shopify Admin GraphQL address preset

CONTENT
# Shopify Admin GraphQL address preset

You can take advantage of [automatic shop access token usage](./automatic-vs-overridden-shopify-access-tokens.md#automatic-shop-access-token-usage) by selecting the prepopulated Shopify Admin GraphQL option in the request address dropdown for HTTP requests.

## Why this helps
The preset fills in a Shopify Admin API address that matches your shop domain and api path like this: `https://yourstore.myshopify.com/admin/api/2025-10/graphql.json`. That address pattern triggers APIEase to inject the shop access token automatically, so you do not need to add an `X-Shopify-Access-Token` header manually.

## How to use it
1. Open your HTTP request in the request editor.
2. Open the request address dropdown.
3. Select **Shopify Admin GraphQL**.
4. Save the request.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/shop-access-token

TITLE
Shop access token

CONTENT
# Shop access token

The shop access token is the Shopify OAuth token issued when a shop installs APIEase. APIEase stores it per shop and uses it to call the Shopify Admin API on that shop's behalf.
If the shop access token does not have the permissions your request needs, you can adjust its permissions as described in [Manage shop access token permissions](./manage-shop-access-token-permissions.md).

## How APIEase uses it
- APIEase app usage: internal Shopify Admin API calls that APIEase makes for the shop use the shop access token.
- Automatic request usage: when a request targets a Shopify Admin API endpoint and you do not provide an override token, APIEase injects the shop access token automatically.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/custom-access-token

TITLE
Custom access token

CONTENT
# Custom access token

If you decide that you need a custom access token rather than using the [shop access token](./shop-access-token.md) that can be [used automatically](./automatic-vs-overridden-shopify-access-tokens.md#automatic-shop-access-token-usage) follow these instructions to get a custom Shopify access token.

For how APIEase uses custom tokens in requests, see [Overridden custom access token usage](./automatic-vs-overridden-shopify-access-tokens.md#overridden-custom-access-token-usage).

1. In your store admin, go to **Settings**.
2. Go to **Apps and sales channels**.
3. Click **Develop apps**.
4. Click **Create an app** and give it a name.
5. Configure permissions: click **Configure Admin API scopes** or **Configure Storefront API scopes** and choose the permissions required. (You must set scopes before you can install and get a token.)
6. Click **Install app** (top right).
7. Click **Reveal token once**. Copy and save your access token—this is the only time it will be shown.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/manage-shop-access-token-permissions

TITLE
Manage shop access token permissions

CONTENT
# Manage shop access token permissions

The Permissions page manages Shopify Admin API permissions for the [shop access token](./shop-access-token.md) that APIEase stores for each shop. Use it to review current permissions, request new scopes, and reauthorize the shop token when access needs change.

## What the Permissions page is for
- Manage OAuth scopes for the stored shop access token.
- Enable future Shopify Admin API calls that require new scopes.
- Keep a clear view of which permissions are granted to APIEase.

## Workflow
1. Open **Settings**, then **Permissions**.
2. Review the current granted scopes.
3. Select the additional scopes you need.
4. Save changes.
5. Complete the Shopify approval flow.
6. Return to the Permissions page and verify the scopes are granted.

## Notes and edge cases
- If you remove scopes, APIEase requests a scope revocation. Shopify may keep a scope if it is required by the app or by Shopify. The Permissions page will show that the scope remains granted.
- If Shopify keeps a scope that you attempted to remove, you may need to reinstall or reauthorize to fully reset the token.
- Existing requests that depend on removed scopes can fail with 403 responses until scopes are restored.
- Changing scopes does not alter request logic. APIEase executes requests exactly as configured.

## Safety note
Write scopes can create, update, or delete store data. Test requests in a non production environment before using them in live flows.

SOURCE
https://docs.apiease.com/docs/general/shopify-api/shopify-graphql-product-count

TITLE
Shopify GraphQL API - Product count

CONTENT
# Shopify GraphQL API - Product count

Demonstration of calling the Shopify GraphQL API to get a count of products in your Shopify product inventory:

Demo store password: eacoht

[https://apiease-demo.myshopify.com/pages/shopify-graphql-api-products](https://apiease-demo.myshopify.com/pages/shopify-rest-api-products)

This example includes an explicit `X-Shopify-Access-Token` header. For automatic shop access token usage and overrides, see [Automatic vs overridden Shopify access tokens](./automatic-vs-overridden-shopify-access-tokens.md).

Example of APIEase Request for Shopify Product Count

- **Address**: [https://apiease-demo.myshopify.com/admin/api/2024-07/graphql.json](https://apiease-demo.myshopify.com/admin/api/2024-01/products/count.json)
- **Method**: `POST`
- **Header parameters:**
  - **Name**: `X-Shopify-Access-Token`  
    **Value**: `your-shopify-access-token` (see [Custom access token](./custom-access-token.md))
  - **Name**: `Content-Type`  
    **Value**: `application/json`
- **Body parameters:**
  - **Value**:

```json
{ "query": "query { productsCount { count } }" }
```

SOURCE
https://docs.apiease.com/docs/general/shopify-api/shopify-rest-product-count

TITLE
Shopify REST API - Product count

CONTENT
# Shopify REST API - Product count

Demonstration of calling the Shopify REST API to get a count of products in your Shopify product inventory:

Demo store password: eacoht

[https://apiease-demo.myshopify.com/pages/shopify-rest-api-products](https://apiease-demo.myshopify.com/pages/shopify-rest-api-products)

This example includes an explicit `X-Shopify-Access-Token` header. For automatic shop access token usage and overrides, see [Automatic vs overridden Shopify access tokens](./automatic-vs-overridden-shopify-access-tokens.md).

Example of APIEase Request for Shopify Product Count

- **Address**: [https://apiease-demo.myshopify.com/admin/api/2024-01/products/count.json](https://apiease-demo.myshopify.com/admin/api/2024-01/products/count.json)
- **Method**: `GET`
- **Header**:
  - **Name**: `X-Shopify-Access-Token`
  - **Value**: your access token (see [Custom access token](./custom-access-token.md))
