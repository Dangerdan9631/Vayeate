// lib.rs
// 
// Copyright (c) 2021 DangerDan9631. All rights reserved.
// Licensed under the MIT License.
// See https://github.com/Dangerdan9631/Vayeate/blob/main/LICENSE for full license information.

//! Top level module doc comments
//! 
//! # Example
//! ```rust
//! let message = example::Message::Terminate;
//! ```

#![warn(
    missing_crate_level_docs,
    missing_debug_implementations,
    missing_docs,
    missing_doc_code_examples,
    trivial_casts,
    trivial_numeric_casts,
    unused_crate_dependencies,
    unused_extern_crates,
    unused_crate_dependencies,
    unused_lifetimes
)]

#![deny(
    absolute_paths_not_starting_with_crate,
    keyword_idents,
    meta_variable_misuse,
    non_ascii_idents,
    pointer_structural_match,
    single_use_lifetimes,
    unaligned_references,
    unreachable_pub,
    unused_qualifications,
    unused_results,
    variant_size_differences,
    deprecated
)]

/// An example module in the example lib.
mod example {
    use std::sync::Arc;
    use std::sync::Mutex;
    use std::sync::mpsc;
    use std::thread;

    /// This is a message
    enum Message {
        NewJob(Job),
        Terminate,
    }

    pub struct ThreadPool {
        workers: Vec<Worker>,
        sender: mpsc::Sender<Message>,
    }

    trait FnBox {
        fn call_box(self:Box<Self>);
    }

    impl<F: FnOnce()> FnBox for F {
        fn call_box(self: Box<F>) {
            (*self)()
        }
    }

    type Job = Box<dyn FnBox + Send + 'static>;

    impl ThreadPool {
        /// Create a new ThreadPool.
        ///
        /// The size is the snumber of threads in the pool.
        ///
        /// # Panics
        /// 
        /// The `new` function will panic if the size is zero.
        pub fn new(size: usize) -> ThreadPool {
            assert!(size > 0);

            let (sender, receiver) = mpsc::channel();
            let receiver = Arc::new(Mutex::new(receiver));

            let mut workers = Vec::with_capacity(size);

            for id in 0..size {
                workers.push(Worker::new(id, Arc::clone(&receiver)));
            }

            ThreadPool { workers, sender }
        }

        pub fn execute<F>(&self, f: F) where F: FnOnce() + Send + 'static {
            let job = Box::new(f);
            self.sender.send(Message::NewJob(job)).unwrap();
        }
    }
    impl Drop for ThreadPool {
        fn drop(&mut self) {
            println!("Sending terminate message to all workers.");
            for _ in &mut self.workers {
                self.sender.send(Message::Terminate).unwrap();
            }

            println!("Shutting down all workers.");
            for worker in &mut self.workers {
                println!("Shutting down worker {}", worker.id);
                if let Some(thread) = worker.thread.take() {
                    thread.join().unwrap();
                }
            }
        }
    }

    struct Worker {
        id: usize,
        thread: Option<thread::JoinHandle<()>>,
    }
    impl Worker {
        fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) -> Worker {
            let thread = thread::spawn(move || {
                loop {
                    let message = receiver.lock().unwrap().recv().unwrap();
                    match message {
                        Message::NewJob(job) => {
                            println!("Worker {} got a job; executing.", id);
                            job.call_box();
                        }
                        Message::Terminate => {
                            println!("Worker {} was told to terminate.", id);
                            break;
                        }
                    }
                }
            });
            Worker { id, thread: Some(thread) }
        }
    }
}