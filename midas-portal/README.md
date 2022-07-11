# The PDR Landing Page Service

A _landing page_ refers to a web page that represents the primary representation of a resource
identified by a persistent identifier (PID), and when a PID is resolved through a web browser, the
associated landing page is what gets displayed.  In the PDR, a landing page is available for each
resources contained in the repository.  That landing page is generated on-the-fly from its NERDm
metadata through the PDR Landing Page Service which is implemented as an Angular application.

This Angular App is implemented as a Angular Universal App.  This means that an initial rendering of
the landing page is generated on the server, and the full rendering is completed in client's
browser.  The server-side rendering include embedded machine-readable metadata for the benefit of
automated scripts and harvesting bots and which drives the browser-side rendering.

